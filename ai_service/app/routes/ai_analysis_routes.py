
from fastapi import APIRouter

from app.schemas.ai_analysis_schema import FinancialAnalysisRequest
from app.schemas.loan_analysis_schema import LoanAnalysisRequest
from app.services.ai_analysis_service import (
    analyze_financial_signup,
    analyze_loan_eligibility,
)
from app.utils.response_builder import success_response

from typing import Annotated, Literal, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field, model_validator

from app.core.constants import Dialect, Occupation, RepaymentHabit, YesNo
from app.services.ai_analysis_service import analyze_signup_profile



router = APIRouter(prefix="/ai-analysis", tags=["AI Analysis"])




class FarmerDetails(BaseModel):
    primary_harvest_crops: list[str] = Field(
        ..., examples=[["Paddy", "Ragi"]], min_length=1
    )
    monthly_cost_of_inputs: Annotated[float, Field(ge=0, examples=[12000])]
    rtc_land_record_ocr_passed: bool = Field(
        ..., description="True when RTC land record OCR document verification passes."
    )


class GroceryShopDetails(BaseModel):
    initial_business_investment: Annotated[float, Field(ge=0, examples=[150000])]
    supplier_credit_terms: YesNo
    inventory_turn_cycle: Literal["Weekly", "Monthly"]


class TailorDetails(BaseModel):
    machinery_asset_count: Annotated[int, Field(ge=0, examples=[2])]
    weekly_order_throughput_capacity: Annotated[int, Field(ge=0, examples=[35])]
    collects_advance_fabric_deposits: YesNo


class WorkerDetails(BaseModel):
    employment_stability_status: Literal[
        "Permanent Daily Wage", "Seasonal Laborer", "Gig Contractor"
    ]
    typical_working_days_per_month: Annotated[int, Field(ge=0, le=31, examples=[22])]
    primary_payment_channel: Literal[
        "Hand-to-Hand Cash", "Local Cooperative Bank", "MNREGA Job Account"
    ]


class SignupAnalysisRequest(BaseModel):
    full_name: Annotated[str, Field(min_length=2, examples=["Ravi Kumar"])]
    mobile_number: Annotated[str, Field(min_length=10, max_length=15, examples=["9876543210"])]
    preferred_dialect: Dialect
    user_occupation_profile: Occupation
    monthly_income_range_baseline: Annotated[float, Field(ge=0, examples=[25000])]
    average_monthly_household_expenses: Annotated[float, Field(ge=0, examples=[18000])]
    has_active_loans: YesNo
    past_repayment_habit: RepaymentHabit

    farmer_details: Optional[FarmerDetails] = None
    grocery_shop_details: Optional[GroceryShopDetails] = None
    tailor_details: Optional[TailorDetails] = None
    worker_details: Optional[WorkerDetails] = None

    @model_validator(mode="after")
    def validate_occupation_details(self):
        required_map = {
            Occupation.FARMER: self.farmer_details,
            Occupation.GROCERY_SHOP: self.grocery_shop_details,
            Occupation.TAILOR: self.tailor_details,
            Occupation.DAILY_WAGE_WORKER: self.worker_details,
        }
        if required_map[self.user_occupation_profile] is None:
            raise ValueError(
                f"{self.user_occupation_profile.value} profile requires matching detail object."
            )
        return self



@router.get("/health")
def health_check():
    return {"status": "ok", "module": "ai_analysis"}



@router.post("/financial-analysis")
def financial_analysis(request: FinancialAnalysisRequest):
    analysis = analyze_financial_signup(request.model_dump())
    return success_response(analysis, "Financial analysis completed")


@router.post("/loan-analysis")
def loan_analysis(request: LoanAnalysisRequest):
    analysis = analyze_loan_eligibility(request.model_dump())
    return success_response(analysis, "Loan analysis completed")

@router.post("/analyze")
def analyze_signup(request: SignupAnalysisRequest):
    return analyze_signup_profile(request.model_dump())

