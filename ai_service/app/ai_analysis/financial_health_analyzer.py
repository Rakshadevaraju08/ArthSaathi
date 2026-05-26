def analyze_financial_health(payload: dict) -> dict:
    income = payload["monthly_income_range_baseline"]
    expenses = payload["average_monthly_household_expenses"]
    surplus = income - expenses
    expense_ratio = (expenses / income) if income else 1

    score = 100
    if expense_ratio > 0.9:
        score -= 35
    elif expense_ratio > 0.75:
        score -= 20
    elif expense_ratio > 0.6:
        score -= 10

    if payload["has_active_loans"] == "Yes":
        score -= 15

    repayment_penalty = {
        "Never": 0,
        "Sometimes": 15,
        "Frequently": 30,
    }
    score -= repayment_penalty[payload["past_repayment_habit"]]
    score = max(0, min(100, score))

    if score >= 75:
        health_band = "Healthy"
    elif score >= 55:
        health_band = "Watch"
    elif score >= 35:
        health_band = "Stressed"
    else:
        health_band = "Critical"

    return {
        "score": score,
        "health_band": health_band,
        "monthly_surplus_or_deficit": round(surplus, 2),
        "expense_to_income_ratio_percent": round(expense_ratio * 100, 2),
    }