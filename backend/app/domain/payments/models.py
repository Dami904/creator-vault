import enum
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import String, Numeric, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TransactionType(str, enum.Enum):
    deposit = "deposit"
    withdrawal = "withdrawal"
    escrow_lock = "escrow_lock"
    escrow_release = "escrow_release"


class EscrowStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    released = "released"
    refunded = "refunded"
    disputed = "disputed"


class Escrow(Base):
    __tablename__ = "escrows"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    job_id: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    funder_address: Mapped[str] = mapped_column(String, nullable=False)
    recipient_address: Mapped[str | None] = mapped_column(String, nullable=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=False)
    contract_address: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[EscrowStatus] = mapped_column(SAEnum(EscrowStatus), default=EscrowStatus.pending)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[TransactionType] = mapped_column(SAEnum(TransactionType), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=False)
    tx_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class EscrowEvent(Base):
    __tablename__ = "escrow_events"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    escrow_id: Mapped[str] = mapped_column(String, nullable=False)
    event_type: Mapped[str] = mapped_column(String, nullable=False)
    tx_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
