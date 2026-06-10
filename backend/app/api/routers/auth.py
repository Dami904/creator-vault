import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.domain.shared.models import User, ProfileType
from app.domain.creators.models import Creator
from app.domain.organizations.models import Organization

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    profile_type: ProfileType


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    profile_type: ProfileType


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        hashed_password=hash_password(body.password),
        role=body.profile_type,
        profile_type=body.profile_type,
    )
    db.add(user)

    if body.profile_type == ProfileType.creator:
        db.add(Creator(id=str(uuid.uuid4()), user_id=user.id))
    else:
        db.add(Organization(id=str(uuid.uuid4()), user_id=user.id))

    await db.commit()
    return TokenResponse(
        access_token=create_access_token(user.id),
        profile_type=body.profile_type,
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return TokenResponse(
        access_token=create_access_token(user.id),
        profile_type=user.profile_type,
    )
