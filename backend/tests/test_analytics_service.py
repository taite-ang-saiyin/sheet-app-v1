from decimal import Decimal

from app.services.analytics_service import calculate_summary


def test_calculate_summary_totals_by_direction_and_payment_method():
    rows = [
        {"amount": "1000.00", "direction": "in", "payment_method": "kpay"},
        {"amount": "300.00", "direction": "out", "payment_method": "kpay"},
        {"amount": "200.50", "direction": "in", "payment_method": "kmbank"},
    ]

    summary = calculate_summary(rows)

    assert summary["total_in"] == Decimal("1201")
    assert summary["total_out"] == Decimal("300")
    assert summary["net_total"] == Decimal("901")
    assert summary["total_kpay"] == Decimal("1300")
    assert summary["total_kmbank"] == Decimal("201")
    assert summary["count"] == 3


def test_calculate_summary_limits_recent_transactions():
    rows = [{"amount": "1", "direction": "in", "payment_method": "kpay"} for _ in range(8)]

    summary = calculate_summary(rows, recent_limit=5)

    assert len(summary["recent_transactions"]) == 5
