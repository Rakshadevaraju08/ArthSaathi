def build_financial_recommendations(
    payload: dict,
    financial_health: dict,
    loan_risk: dict,
    savings_prediction: dict,
    spending_behavior: dict,
    occupation_analysis: dict,
) -> dict:
    action_rules = {
        "Reduce non-essential expenses before taking new credit.": financial_health[
            "monthly_surplus_or_deficit"
        ] < 0,
        "Start an emergency reserve using monthly savings capacity.": savings_prediction[
            "conservative_monthly_savings_capacity"
        ] > 0,
        "Capture active loan EMI amount before final eligibility decision.": payload[
            "has_active_loans"
        ] == "Yes",
        "Offer repayment reminders and smaller installment schedules.": payload[
            "past_repayment_habit"
        ] != "Never",
        "Use occupation-specific signals in lender dashboard review.": True,
    }

    next_step_by_risk = {
        "Low": "Eligible for assisted onboarding",
        "Moderate": "Eligible with lender review",
        "High": "Manual review recommended",
        "Critical": "Manual review recommended",
    }

    return {
        "next_step": next_step_by_risk[loan_risk["risk_band"]],
        "recommended_actions": [
            action for action, enabled in action_rules.items() if enabled
        ],
        "summary": (
            f"{payload['user_occupation_profile']} applicant has "
            f"{financial_health['health_band'].lower()} financial health, "
            f"{spending_behavior['behavior_band'].lower()}, and "
            f"{loan_risk['risk_band'].lower()} loan risk."
        ),
        "occupation_signal": occupation_analysis["dashboard_signal"],
    }