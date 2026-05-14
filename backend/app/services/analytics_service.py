from decimal import Decimal, ROUND_HALF_UP
from typing import Iterable


def _money(value) -> Decimal:
    return Decimal(str(value or "0")).quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def calculate_summary(transactions: Iterable[dict], recent_limit: int = 5) -> dict:
    rows = list(transactions)
    total_in = Decimal("0.00")
    total_out = Decimal("0.00")
    total_kpay = Decimal("0.00")
    total_kmbank = Decimal("0.00")

    for row in rows:
        amount = _money(row.get("amount"))
        if row.get("direction") == "in":
            total_in += amount
        elif row.get("direction") == "out":
            total_out += amount

        if row.get("payment_method") == "kpay":
            total_kpay += amount
        elif row.get("payment_method") == "kmbank":
            total_kmbank += amount

    return {
        "total_in": total_in.quantize(Decimal("1")),
        "total_out": total_out.quantize(Decimal("1")),
        "net_total": (total_in - total_out).quantize(Decimal("1")),
        "total_kpay": total_kpay.quantize(Decimal("1")),
        "total_kmbank": total_kmbank.quantize(Decimal("1")),
        "count": len(rows),
        "recent_transactions": rows[-recent_limit:],
    }
