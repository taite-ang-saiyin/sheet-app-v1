from datetime import date
from typing import Optional
from uuid import UUID

from postgrest.exceptions import APIError
from supabase import Client

from app.models.transaction import TransactionCreate, TransactionUpdate


class TransactionServiceError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _serialize_payload(payload: dict) -> dict:
    serialized = {}
    for key, value in payload.items():
        if value is None:
            continue
        if hasattr(value, "isoformat"):
            serialized[key] = value.isoformat()
        else:
            serialized[key] = str(value) if key == "amount" else value
    return serialized


def _raise_supabase_error(error: APIError):
    message = getattr(error, "message", None) or str(error)
    raise TransactionServiceError(
        f"ဒေတာ သိမ်းဆည်းရာတွင် အမှားရှိပါသည်။ ({message})", 502
    )


def create_transaction(client: Client, data: TransactionCreate) -> dict:
    payload = _serialize_payload(data.model_dump())
    try:
        response = client.table("transactions").insert(payload).execute()
    except APIError as error:
        _raise_supabase_error(error)

    if not response.data:
        raise TransactionServiceError("စာရင်းသွင်းမှု မအောင်မြင်ပါ။", 502)
    return response.data[0]


def list_transactions(
    client: Client,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    direction: Optional[str] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
) -> list[dict]:
    query = client.table("transactions").select("*")

    if start_date:
        query = query.gte("transaction_date", start_date.isoformat())
    if end_date:
        query = query.lte("transaction_date", end_date.isoformat())
    if direction:
        query = query.eq("direction", direction)
    if payment_method:
        query = query.eq("payment_method", payment_method)
    if search:
        query = query.ilike("person_name", f"%{search.strip()}%")

    try:
        response = (
            query.order("transaction_date", desc=True)
            .order("created_at", desc=True)
            .execute()
        )
    except APIError as error:
        _raise_supabase_error(error)

    return response.data or []


def update_transaction(client: Client, transaction_id: UUID, data: TransactionUpdate) -> dict:
    payload = _serialize_payload(data.model_dump(exclude_unset=True))
    try:
        response = (
            client.table("transactions")
            .update(payload)
            .eq("id", str(transaction_id))
            .execute()
        )
    except APIError as error:
        _raise_supabase_error(error)

    if not response.data:
        raise TransactionServiceError("ပြင်ဆင်မည့် စာရင်း မတွေ့ပါ။", 404)
    return response.data[0]


def delete_transaction(client: Client, transaction_id: UUID) -> dict:
    try:
        response = (
            client.table("transactions")
            .delete()
            .eq("id", str(transaction_id))
            .execute()
        )
    except APIError as error:
        _raise_supabase_error(error)

    if not response.data:
        raise TransactionServiceError("ဖျက်မည့် စာရင်း မတွေ့ပါ။", 404)
    return {"deleted": True, "id": str(transaction_id)}
