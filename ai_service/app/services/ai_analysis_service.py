
from app.analyzers.farmer_analyzer import analyze_farmer
from app.analyzers.financial_health_analyzer import analyze_financial_health
from app.analyzers.grocery_analyzer import analyze_grocery
from app.analyzers.loan_risk_engine import calculate_loan_risk
from app.analyzers.loan_score_analyzer import analyze_loan_request
from app.analyzers.savings_predictor import predict_savings
from app.analyzers.spending_behavior_analyzer import analyze_spending_behavior
from app.analyzers.tailor_analyzer import analyze_tailor
from app.analyzers.worker_analyzer import analyze_worker
from app.services.recommendation_engine import build_financial_recommendations
from app.utils.id_generator import add_unique_id, generate_id


OCCUPATION_ANALYZERS = {
    "Farmer": ("farmer_details", analyze_farmer),
    "Grocery Shop": ("grocery_shop_details", analyze_grocery),
    "Tailor": ("tailor_details", analyze_tailor),
    "Daily Wage Worker": ("worker_details", analyze_worker),
}


def analyze_financial_signup(payload: dict) -> dict:
    occupation_analysis = analyze_occupation(payload)

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


    recommendations = build_financial_recommendations(
        payload=payload,

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

        "analysis_id": generate_id("financial_analysis"),
        "applicant": add_unique_id(
            "applicant",
            {
                "full_name": payload["full_name"],
                "mobile_number": payload["mobile_number"],
                "preferred_dialect": payload["preferred_dialect"],
                "occupation": payload["user_occupation_profile"],
            },
        ),
        "financial_health": add_unique_id("financial_health", financial_health),
        "loan_risk": add_unique_id("loan_risk", loan_risk),
        "savings_prediction": add_unique_id("savings_prediction", savings_prediction),
        "spending_behavior": add_unique_id("spending_behavior", spending_behavior),
        "occupation_specific_analysis": add_unique_id(
            "occupation_specific_analysis", occupation_analysis
        ),
        "recommendations": add_unique_id("recommendations", recommendations),
        "lender_dashboard_payload": build_lender_financial_card(
            financial_health,
            loan_risk,
            savings_prediction,
            spending_behavior,
            occupation_analysis,
        ),
    }


def analyze_loan_eligibility(payload: dict) -> dict:
    loan_analysis = analyze_loan_request(payload)

    return {
        "analysis_id": generate_id("loan_analysis"),
        "applicant": add_unique_id(
            "loan_applicant",
            {
                "applicant_id": payload.get("applicant_id"),
                "applicant_name": payload["applicant_name"],
                "occupation": payload["occupation"],
                "loan_purpose": payload["loan_purpose"],
            },
        ),
        "loan_analysis": add_unique_id("loan_analysis_result", loan_analysis),
    }


def analyze_occupation(payload: dict) -> dict:
    detail_key, analyzer = OCCUPATION_ANALYZERS[payload["user_occupation_profile"]]
    return analyzer(payload[detail_key])


def build_lender_financial_card(
    financial_health: dict,
    loan_risk: dict,
    savings_prediction: dict,
    spending_behavior: dict,
    occupation_analysis: dict,
) -> dict:
    return {
        "dashboard_route": "/dashboard",
        "applicants_route": "/applicants",
        "analytics_route": "/analytics",
        "card_type": "financial_health_summary",
        "financial_health_score": financial_health["score"],
        "financial_health_band": financial_health["health_band"],
        "risk_level": loan_risk["risk_band"],
        "loan_readiness": loan_risk["loan_readiness"],
        "monthly_savings_capacity": savings_prediction[
            "current_monthly_savings_capacity"
        ],
        "spending_behavior": spending_behavior["behavior_band"],
        "occupation_track": occupation_analysis["track"],
    }
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

