from app.analyzers.financial_health_analyzer import analyze_financial_health
from app.analyzers.loan_risk_engine import calculate_loan_risk
from app.analyzers.occupation_analyzers import OCCUPATION_ANALYZERS
from app.analyzers.savings_predictor import predict_savings
from app.analyzers.spending_behavior_analyzer import analyze_spending_behavior
from app.utils.id_generator import add_unique_id, generate_id


def analyze_financial_profile(payload: dict) -> dict:
    detail_key, analyzer = OCCUPATION_ANALYZERS[payload["user_occupation_profile"]]

    occupation_analysis = analyzer(payload[detail_key])
    financial_health = analyze_financial_health(payload)
    spending_behavior = analyze_spending_behavior(payload)
    savings_prediction = predict_savings(payload)
    loan_risk = calculate_loan_risk(payload, financial_health, spending_behavior)

    return {
        "analysis_id": generate_id("financial_analysis"),
        "applicant": add_unique_id("applicant", {
            "full_name": payload["full_name"],
            "mobile_number": payload["mobile_number"],
            "preferred_dialect": payload["preferred_dialect"],
            "occupation": payload["user_occupation_profile"],
        }),
        "financial_health": add_unique_id("financial_health", financial_health),
        "loan_risk": add_unique_id("loan_risk", loan_risk),
        "savings_prediction": add_unique_id("savings_prediction", savings_prediction),
        "spending_behavior": add_unique_id("spending_behavior", spending_behavior),
        "occupation_specific_analysis": add_unique_id(
            "occupation_specific_analysis",
            occupation_analysis,
        ),
        "lender_dashboard_payload": {
            "card_type": "financial_health_summary",
            "financial_health_score": financial_health["score"],
            "financial_health_band": financial_health["health_band"],
            "risk_level": loan_risk["risk_band"],
            "loan_readiness": loan_risk["loan_readiness"],
            "monthly_savings_capacity": savings_prediction["current_monthly_savings_capacity"],
            "occupation_track": occupation_analysis["track"],
        },
    }