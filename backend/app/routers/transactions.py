from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.db import get_supabase_client
from app.models.transaction import (
    Direction,
    PaymentMethod,
    TransactionCreate,
    TransactionRead,
    TransactionSummary,
    TransactionUpdate,
)
from app.services.analytics_service import calculate_summary
from app.services.transaction_service import (
    TransactionServiceError,
    create_transaction,
    delete_transaction,
    list_transactions,
    update_transaction,
)

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


def _handle_service_error(error: TransactionServiceError):
    raise HTTPException(status_code=error.status_code, detail=error.message) from error


@router.post("", response_model=TransactionRead, status_code=201)
def create_transaction_endpoint(
    payload: TransactionCreate,
    client: Client = Depends(get_supabase_client),
):
    try:
        return create_transaction(client, payload)
    except TransactionServiceError as error:
        _handle_service_error(error)


@router.get("", response_model=list[TransactionRead])
def list_transactions_endpoint(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    direction: Optional[Direction] = Query(default=None),
    payment_method: Optional[PaymentMethod] = Query(default=None),
    search: Optional[str] = Query(default=None, max_length=120),
    client: Client = Depends(get_supabase_client),
):
    try:
        return list_transactions(
            client=client,
            start_date=start_date,
            end_date=end_date,
            direction=direction,
            payment_method=payment_method,
            search=search,
        )
    except TransactionServiceError as error:
        _handle_service_error(error)


@router.get("/summary", response_model=TransactionSummary)
def summary_endpoint(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    client: Client = Depends(get_supabase_client),
):
    try:
        rows = list_transactions(client=client, start_date=start_date, end_date=end_date)
        return calculate_summary(rows)
    except TransactionServiceError as error:
        _handle_service_error(error)


@router.put("/{transaction_id}", response_model=TransactionRead)
def update_transaction_endpoint(
    transaction_id: UUID,
    payload: TransactionUpdate,
    client: Client = Depends(get_supabase_client),
):
    try:
        return update_transaction(client, transaction_id, payload)
    except TransactionServiceError as error:
        _handle_service_error(error)


@router.delete("/{transaction_id}")
def delete_transaction_endpoint(
    transaction_id: UUID,
    client: Client = Depends(get_supabase_client),
):
    try:
        return delete_transaction(client, transaction_id)
    except TransactionServiceError as error:
        _handle_service_error(error)
