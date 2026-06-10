from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.domain.shared.models import User, ProfileType
from app.domain.creators.models import Creator
from app.domain.organizations.models import Organization

router = APIRouter()


@router.get("/{wallet_address}")
async def get_reputation_by_wallet(
    wallet_address: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.wallet_address == wallet_address))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Wallet not found")

    if user.profile_type == ProfileType.creator:
        profile_result = await db.execute(select(Creator).where(Creator.user_id == user.id))
    else:
        profile_result = await db.execute(select(Organization).where(Organization.user_id == user.id))

    profile = profile_result.scalar_one_or_none()
    return {
        "wallet_address": wallet_address,
        "score": profile.reputation_score if profile else 0,
        "on_chain_score": 0,
    }
