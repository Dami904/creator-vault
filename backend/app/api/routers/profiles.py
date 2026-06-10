from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.domain.shared.models import User, ProfileType
from app.domain.creators.models import Creator
from app.domain.organizations.models import Organization

router = APIRouter()


class CreatorUpdate(BaseModel):
    name: str | None = None
    bio: str | None = None
    niche_tags: list[str] | None = None
    instagram: str | None = None
    twitter: str | None = None
    youtube: str | None = None
    tiktok: str | None = None


class OrgUpdate(BaseModel):
    brand_name: str | None = None
    description: str | None = None
    website_url: str | None = None


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.profile_type == ProfileType.creator:
        result = await db.execute(select(Creator).where(Creator.user_id == current_user.id))
        profile = result.scalar_one_or_none()
    else:
        result = await db.execute(select(Organization).where(Organization.user_id == current_user.id))
        profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/me")
async def update_my_profile(
    body: CreatorUpdate | OrgUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.profile_type == ProfileType.creator:
        result = await db.execute(select(Creator).where(Creator.user_id == current_user.id))
        profile = result.scalar_one_or_none()
    else:
        result = await db.execute(select(Organization).where(Organization.user_id == current_user.id))
        profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for key, value in body.model_dump(exclude_none=True).items():
        setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/reputation/me")
async def get_my_reputation(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.profile_type == ProfileType.creator:
        result = await db.execute(select(Creator).where(Creator.user_id == current_user.id))
        profile = result.scalar_one_or_none()
    else:
        result = await db.execute(select(Organization).where(Organization.user_id == current_user.id))
        profile = result.scalar_one_or_none()

    return {
        "wallet_address": current_user.wallet_address,
        "score": profile.reputation_score if profile else 0,
        "on_chain_score": 0,
    }
