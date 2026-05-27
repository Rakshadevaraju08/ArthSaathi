def build_recommendations(
    payload: dict,
    profile: dict,
    financial_health: dict,
    loan_risk: dict,
    savings_prediction: dict,
    spending_behavior: dict,
    occupation_analysis: dict,
) -> dict:
    actions = []

    if financial_health["monthly_surplus_or_deficit"] < 0:
        actions.append("Reduce non-essential expenses before taking new credit.")
    elif savings_prediction["conservative_monthly_savings_capacity"] > 0:
        actions.append("Start an emergency reserve using monthly savings capacity.")

    if payload["has_active_loans"] == "Yes":
        actions.append("Capture active loan EMI amount before final eligibility decision.")

    if payload["past_repayment_habit"] != "Never":
        actions.append("Offer repayment reminders and smaller installment schedules.")

    occupation = payload["user_occupation_profile"]
    if occupation == "Farmer":
        actions.append("Use crop seasonality and RTC verification before farm credit sizing.")
    elif occupation == "Grocery Shop":
        actions.append("Match credit limit to inventory turn cycle and supplier credit exposure.")
    elif occupation == "Tailor":
        actions.append("Use machine count and weekly order capacity for micro-business scoring.")
    elif occupation == "Daily Wage Worker":
        actions.append("Prefer payment-channel proof for income stability validation.")

    if loan_risk["risk_band"] in {"High", "Critical"}:
        next_step = "Manual review recommended"
    elif financial_health["health_band"] in {"Healthy", "Watch"}:
        next_step = "Eligible for assisted onboarding"
    else:
        next_step = "Collect more affordability details"

    return {
        "next_step": next_step,
        "recommended_actions": actions,
        "summary": (
            f"{profile['occupation_segment']} applicant has "
            f"{financial_health['health_band'].lower()} financial health, "
            f"{spending_behavior['behavior_band'].lower()}, and "
            f"{loan_risk['risk_band'].lower()} loan risk."
        ),
        "occupation_signal": occupation_analysis.get("insight"),
    }