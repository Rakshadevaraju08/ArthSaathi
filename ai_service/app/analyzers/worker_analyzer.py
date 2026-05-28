from app.analyzers.common import band_from_thresholds


def analyze_worker(details: dict) -> dict:
    return {
        "track": "Daily Wage Worker",
        "work_consistency": band_from_thresholds(
            details["typical_working_days_per_month"],
            ((17, "Low"), (23, "Moderate"), (31, "High")),
        ),
        "income_predictability": details["employment_stability_status"],
        "banking_visibility": {
            "Hand-to-Hand Cash": "Low",
            "Local Cooperative Bank": "High",
            "MNREGA Job Account": "High",
        }[details["primary_payment_channel"]],
        "dashboard_signal": "Workday consistency and payment-channel visibility available.",
    }