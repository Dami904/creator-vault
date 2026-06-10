import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from decimal import Decimal

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.domain.shared.models import User
from app.domain.payments.models import Transaction, TransactionType

router = APIRouter()


class DepositBody(BaseModel):
    tx_hash: str
    amount: float


class WithdrawBody(BaseModel):
    amount: float
    destination_address: str


@router.get("/balance")
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == current_user.id)
    )
    txs = result.scalars().all()

    balance = Decimal("0")
    for tx in txs:
        if tx.type in (TransactionType.deposit, TransactionType.escrow_release):
            balance += tx.amount
        else:
            balance -= tx.amount

    return {"balance": str(balance)}


@router.post("/deposit", status_code=201)
async def record_deposit(
    body: DepositBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx = Transaction(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        type=TransactionType.deposit,
        amount=Decimal(str(body.amount)),
        tx_hash=body.tx_hash,
    )
    db.add(tx)
    await db.commit()
    return tx


@router.post("/withdraw", status_code=201)
async def withdraw(
    body: WithdrawBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx = Transaction(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        type=TransactionType.withdrawal,
        amount=Decimal(str(body.amount)),
        tx_hash=None,
    )
    db.add(tx)
    await db.commit()
    return tx


@router.get("/transactions")
async def list_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
    )
    return result.scalars().all()
