def calculate_loan_risk(
    payload: dict, financial_health: dict, spending_behavior: dict
) -> dict:
    risk_score = 20

    if payload["has_active_loans"] == "Yes":
        risk_score += 20

    repayment_risk = {
        "Never": 0,
        "Sometimes": 20,
        "Frequently": 35,
    }
    risk_score += repayment_risk[payload["past_repayment_habit"]]

    if financial_health["monthly_surplus_or_deficit"] < 0:
        risk_score += 25
    elif financial_health["monthly_surplus_or_deficit"] < 3000:
        risk_score += 10

    if spending_behavior["behavior_band"] == "High Expense Pressure":
        risk_score += 15

    risk_score = max(0, min(100, risk_score))

    if risk_score <= 35:
        risk_band = "Low"
    elif risk_score <= 60:
        risk_band = "Moderate"
    elif risk_score <= 80:
        risk_band = "High"
    else:
        risk_band = "Critical"

    return {
        "risk_score": risk_score,
        "risk_band": risk_band,
        "loan_readiness": risk_band in {"Low", "Moderate"},
    }