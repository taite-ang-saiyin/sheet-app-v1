from datetime import date
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.models.transaction import TransactionCreate, TransactionUpdate


def test_transaction_create_accepts_valid_payload():
    payload = TransactionCreate(
        person_name="မမ",
        amount=Decimal("25000"),
        transaction_date=date(2026, 5, 14),
        direction="in",
        payment_method="kpay",
    )

    assert payload.person_name == "မမ"
    assert payload.amount == Decimal("25000")


def test_transaction_create_rounds_fractional_amount_to_whole_kyat():
    payload = TransactionCreate(
        person_name="မမ",
        amount=Decimal("99999.98"),
        transaction_date=date(2026, 5, 14),
        direction="in",
        payment_method="kpay",
    )

    assert payload.amount == Decimal("100000")


def test_transaction_create_rejects_zero_amount():
    with pytest.raises(ValidationError):
        TransactionCreate(
            person_name="မမ",
            amount=Decimal("0"),
            transaction_date=date.today(),
            direction="in",
            payment_method="kpay",
        )


def test_transaction_create_trims_and_rejects_empty_name():
    with pytest.raises(ValidationError):
        TransactionCreate(
            person_name="   ",
            amount=Decimal("1000"),
            transaction_date=date.today(),
            direction="out",
            payment_method="kmbank",
        )


def test_transaction_update_requires_at_least_one_field():
    with pytest.raises(ValidationError):
        TransactionUpdate()
