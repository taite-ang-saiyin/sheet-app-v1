from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_serializer, field_validator, model_validator


Direction = Literal["in", "out"]
PaymentMethod = Literal["kpay", "kmbank"]


class TransactionBase(BaseModel):
    person_name: str = Field(..., min_length=1, max_length=120)
    amount: Decimal = Field(..., gt=Decimal("0"), max_digits=12, decimal_places=2)
    transaction_date: date
    direction: Direction
    payment_method: PaymentMethod

    @field_validator("person_name")
    @classmethod
    def clean_person_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("အမည် ဖြည့်ရန် လိုအပ်ပါသည်။")
        return cleaned


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    person_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    amount: Optional[Decimal] = Field(
        default=None, gt=Decimal("0"), max_digits=12, decimal_places=2
    )
    transaction_date: Optional[date] = None
    direction: Optional[Direction] = None
    payment_method: Optional[PaymentMethod] = None

    @field_validator("person_name")
    @classmethod
    def clean_person_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("အမည် ဖြည့်ရန် လိုအပ်ပါသည်။")
        return cleaned

    @model_validator(mode="after")
    def at_least_one_field(self):
        if not any(
            getattr(self, field) is not None
            for field in (
                "person_name",
                "amount",
                "transaction_date",
                "direction",
                "payment_method",
            )
        ):
            raise ValueError("ပြင်ဆင်ရန် အချက်အလက် အနည်းဆုံးတစ်ခု လိုအပ်ပါသည်။")
        return self


class TransactionRead(TransactionBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> float:
        return float(value)


class TransactionSummary(BaseModel):
    total_in: Decimal
    total_out: Decimal
    net_total: Decimal
    total_kpay: Decimal
    total_kmbank: Decimal
    count: int
    recent_transactions: list[TransactionRead]

    @field_serializer("total_in", "total_out", "net_total", "total_kpay", "total_kmbank")
    def serialize_money(self, value: Decimal) -> float:
        return float(value)
