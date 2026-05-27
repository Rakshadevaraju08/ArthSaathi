def analyze_worker_profile(details: dict) -> dict:
    stability = details["employment_stability_status"]
    days = details["typical_working_days_per_month"]
    channel = details["primary_payment_channel"]

    if days >= 24:
        work_consistency = "High"
    elif days >= 18:
        work_consistency = "Moderate"
    else:
        work_consistency = "Low"

    if stability == "Permanent Daily Wage":
        income_predictability = "Stable"
    elif stability == "Seasonal Laborer":
        income_predictability = "Seasonal"
    else:
        income_predictability = "Variable"

    banking_visibility = (
        "High" if channel in {"Local Cooperative Bank", "MNREGA Job Account"} else "Low"
    )

    return {
        "track": "Daily Wage Worker",
        "work_consistency": work_consistency,
        "income_predictability": income_predictability,
        "banking_visibility": banking_visibility,
        "insight": "Bank-linked payments improve income traceability."
        if banking_visibility == "High"
        else "Cash payments may need alternate proof of income.",
    }