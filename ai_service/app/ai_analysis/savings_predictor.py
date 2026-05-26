def predict_savings(payload: dict) -> dict:
    income = payload["monthly_income_range_baseline"]
    expenses = payload["average_monthly_household_expenses"]
    current_monthly_savings = income - expenses

    conservative_monthly_savings = max(current_monthly_savings * 0.8, 0)
    six_month_projection = conservative_monthly_savings * 6
    twelve_month_projection = conservative_monthly_savings * 12

    return {
        "current_monthly_savings_capacity": round(current_monthly_savings, 2),
        "conservative_monthly_savings_capacity": round(conservative_monthly_savings, 2),
        "six_month_projection": round(six_month_projection, 2),
        "twelve_month_projection": round(twelve_month_projection, 2),
    }