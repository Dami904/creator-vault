import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from decimal import Decimal

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.domain.shared.models import User, ProfileType
from app.domain.deals.models import Job, Milestone, Application, JobStatus, MilestoneStatus, ApplicationStatus
from app.agents.ai_verifier import verify_milestone

router = APIRouter()


class MilestoneIn(BaseModel):
    title: str
    description: str
    amount: float
    deadline: str


class JobCreate(BaseModel):
    title: str
    description: str
    target_platform: str
    post_type: str
    required_elements: list[str] = []
    payout_type: str = "milestone"
    milestones: list[MilestoneIn] = []
    total_budget: float
    deadline: str
    eligibility: dict = {}


class ApplyBody(BaseModel):
    cover_note: str


class SubmitDeliverableBody(BaseModel):
    deliverable_url: str


class DisputeBody(BaseModel):
    reason: str


@router.post("/jobs", status_code=201)
async def create_job(
    body: JobCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.profile_type != ProfileType.organization:
        raise HTTPException(status_code=403, detail="Only organizations can post jobs")

    job = Job(
        id=str(uuid.uuid4()),
        organization_id=current_user.id,
        title=body.title,
        description=body.description,
        target_platform=body.target_platform,
        post_type=body.post_type,
        required_elements=body.required_elements,
        payout_type=body.payout_type,
        total_budget=Decimal(str(body.total_budget)),
        deadline=body.deadline,
        eligibility=body.eligibility,
        status=JobStatus.open,
    )
    db.add(job)

    for m in body.milestones:
        db.add(Milestone(
            id=str(uuid.uuid4()),
            job_id=job.id,
            title=m.title,
            description=m.description,
            amount=Decimal(str(m.amount)),
            deadline=m.deadline,
            status=MilestoneStatus.pending,
        ))

    await db.commit()
    await db.refresh(job)
    return job


@router.get("/jobs")
async def list_jobs(
    status: str | None = None,
    platform: str | None = None,
    post_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Job)
    if status:
        query = query.where(Job.status == status)
    if platform:
        query = query.where(Job.target_platform == platform)
    if post_type:
        query = query.where(Job.post_type == post_type)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/jobs/{job_id}")
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/jobs/{job_id}/apply", status_code=201)
async def apply_to_job(
    job_id: str,
    body: ApplyBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.profile_type != ProfileType.creator:
        raise HTTPException(status_code=403, detail="Only creators can apply")

    application = Application(
        id=str(uuid.uuid4()),
        job_id=job_id,
        creator_id=current_user.id,
        cover_note=body.cover_note,
        status=ApplicationStatus.pending,
    )
    db.add(application)
    await db.commit()
    return application


@router.get("/jobs/{job_id}/applications")
async def list_applications(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Application).where(Application.job_id == job_id))
    return result.scalars().all()


@router.post("/jobs/{job_id}/select/{creator_id}")
async def select_creator(
    job_id: str,
    creator_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.selected_creator_id = creator_id
    job.status = JobStatus.in_progress

    app_result = await db.execute(
        select(Application).where(Application.job_id == job_id, Application.creator_id == creator_id)
    )
    application = app_result.scalar_one_or_none()
    if application:
        application.status = ApplicationStatus.accepted

    await db.commit()
    return job


@router.get("/jobs/{job_id}/milestones")
async def list_milestones(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Milestone).where(Milestone.job_id == job_id))
    return result.scalars().all()


@router.post("/milestones/{milestone_id}/submit")
async def submit_deliverable(
    milestone_id: str,
    body: SubmitDeliverableBody,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Milestone).where(Milestone.id == milestone_id))
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone.deliverable_url = body.deliverable_url
    milestone.status = MilestoneStatus.submitted
    await db.commit()

    background_tasks.add_task(_run_ai_verification, milestone_id, db)
    return milestone


@router.post("/milestones/{milestone_id}/approve")
async def approve_milestone(
    milestone_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Milestone).where(Milestone.id == milestone_id))
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone.status = MilestoneStatus.approved
    await db.commit()
    return milestone


@router.post("/milestones/{milestone_id}/dispute")
async def dispute_milestone(
    milestone_id: str,
    body: DisputeBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Milestone).where(Milestone.id == milestone_id))
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone.status = MilestoneStatus.disputed
    await db.commit()
    return milestone


async def _run_ai_verification(milestone_id: str, db: AsyncSession):
    result = await db.execute(
        select(Milestone).where(Milestone.id == milestone_id)
    )
    milestone = result.scalar_one_or_none()
    if not milestone or not milestone.deliverable_url:
        return

    job_result = await db.execute(select(Job).where(Job.id == milestone.job_id))
    job = job_result.scalar_one_or_none()
    if not job:
        return

    verdict = await verify_milestone(
        job_brief=job.description,
        required_elements=job.required_elements,
        post_type=job.post_type,
        deliverable_url=milestone.deliverable_url,
    )

    milestone.ai_verdict = verdict.verdict
    milestone.ai_reason = verdict.reason
    milestone.ai_confidence = verdict.confidence
    await db.commit()
