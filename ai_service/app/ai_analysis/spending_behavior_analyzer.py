def analyze_spending_behavior(payload: dict) -> dict:
    income = payload["monthly_income_range_baseline"]
    expenses = payload["average_monthly_household_expenses"]
    expense_ratio = (expenses / income) if income else 1

    if expense_ratio <= 0.6:
        behavior_band = "Controlled Spending"
        behavior_note = "Household expenses leave meaningful room for savings."
    elif expense_ratio <= 0.8:
        behavior_band = "Balanced Spending"
        behavior_note = "Expenses are manageable but should be watched monthly."
    elif expense_ratio <= 1:
        behavior_band = "High Expense Pressure"
        behavior_note = "Most income is consumed by household expenses."
    else:
        behavior_band = "Deficit Spending"
        behavior_note = "Monthly expenses exceed reported income."

    return {
        "behavior_band": behavior_band,
        "expense_ratio_percent": round(expense_ratio * 100, 2),
        "behavior_note": behavior_note,
    }