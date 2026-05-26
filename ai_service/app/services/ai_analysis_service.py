from app.ai_analysis.farmer_analyzer import analyze_farmer_profile
from app.ai_analysis.financial_health_analyzer import analyze_financial_health
from app.ai_analysis.grocery_analyzer import analyze_grocery_profile
from app.ai_analysis.loan_risk_engine import calculate_loan_risk
from app.ai_analysis.profile_classifier import classify_profile
from app.ai_analysis.recommendation_engine import build_recommendations
from app.ai_analysis.savings_predictor import predict_savings
from app.ai_analysis.spending_behavior_analyzer import analyze_spending_behavior
from app.ai_analysis.tailor_analyzer import analyze_tailor_profile
from app.ai_analysis.worker_analyzer import analyze_worker_profile


def analyze_signup_profile(payload: dict) -> dict:
    profile = classify_profile(payload)
    financial_health = analyze_financial_health(payload)
    spending_behavior = analyze_spending_behavior(payload)
    savings_prediction = predict_savings(payload)
    loan_risk = calculate_loan_risk(payload, financial_health, spending_behavior)
    occupation_analysis = _run_occupation_analyzer(payload)
    recommendations = build_recommendations(
        payload=payload,
        profile=profile,
        financial_health=financial_health,
        loan_risk=loan_risk,
        savings_prediction=savings_prediction,
        spending_behavior=spending_behavior,
        occupation_analysis=occupation_analysis,
    )

    return {
        "applicant": {
            "full_name": payload["full_name"],
            "mobile_number": payload["mobile_number"],
            "preferred_dialect": payload["preferred_dialect"],
            "occupation": payload["user_occupation_profile"],
        },
        "profile_classifier": profile,
        "financial_health": financial_health,
        "loan_risk": loan_risk,
        "savings_prediction": savings_prediction,
        "spending_behavior": spending_behavior,
        "occupation_specific_analysis": occupation_analysis,
        "recommendations": recommendations,
    }


def _run_occupation_analyzer(payload: dict) -> dict:
    occupation = payload["user_occupation_profile"]

    if occupation == "Farmer":
        return analyze_farmer_profile(payload["farmer_details"])
    if occupation == "Grocery Shop":
        return analyze_grocery_profile(payload["grocery_shop_details"])
    if occupation == "Tailor":
        return analyze_tailor_profile(payload["tailor_details"])
    if occupation == "Daily Wage Worker":
        return analyze_worker_profile(payload["worker_details"])

    return {"status": "unsupported_occupation", "message": "No analyzer available."}