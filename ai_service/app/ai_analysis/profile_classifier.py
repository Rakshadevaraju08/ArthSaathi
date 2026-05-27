def classify_profile(payload: dict) -> dict:
    income = payload["monthly_income_range_baseline"]
    expenses = payload["average_monthly_household_expenses"]
    occupation = payload["user_occupation_profile"]
    savings_ratio = ((income - expenses) / income) if income else 0

    if income < 12000:
        income_band = "Low Income"
    elif income <= 35000:
        income_band = "Moderate Income"
    else:
        income_band = "Growing Income"

    if savings_ratio >= 0.25:
        resilience = "Strong"
    elif savings_ratio >= 0.1:
        resilience = "Stable"
    elif savings_ratio >= 0:
        resilience = "Tight"
    else:
        resilience = "Deficit"

    return {
        "occupation_segment": occupation,
        "income_band": income_band,
        "financial_resilience": resilience,
        "savings_ratio_percent": round(savings_ratio * 100, 2),
    }