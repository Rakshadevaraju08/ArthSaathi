from app.analyzers.loan_score_analyzer import analyze_loan_score
from app.utils.id_generator import add_unique_id, generate_id


def analyze_loan_application(payload: dict) -> dict:
    loan_analysis = analyze_loan_score(payload)

    return {
        "analysis_id": generate_id("loan_analysis"),
        "applicant": add_unique_id("loan_applicant", {
            "applicant_id": payload.get("applicant_id"),
            "applicant_name": payload["applicant_name"],
            "occupation": payload["occupation"],
            "loan_purpose": payload["loan_purpose"],
            "amount_needed": payload["amount_needed"],
            "repayment_period_months": payload["repayment_period_months"],
        }),
        "loan_analysis": add_unique_id("loan_analysis_result", loan_analysis),
    }