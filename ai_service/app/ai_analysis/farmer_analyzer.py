def analyze_farmer_profile(details: dict) -> dict:
    crops = details["primary_harvest_crops"]
    monthly_input_cost = details["monthly_cost_of_inputs"]
    ocr_passed = details["rtc_land_record_ocr_passed"]

    crop_risk = "Medium"
    if "Vegetables" in crops:
        crop_risk = "High"
    elif "Ragi" in crops:
        crop_risk = "Low"

    input_cost_band = "Low"
    if monthly_input_cost > 20000:
        input_cost_band = "High"
    elif monthly_input_cost >= 8000:
        input_cost_band = "Medium"

    return {
        "track": "Farmer",
        "crop_mix": crops,
        "seasonality_risk": crop_risk,
        "input_cost_band": input_cost_band,
        "document_confidence": "Verified" if ocr_passed else "Needs Manual Review",
        "insight": "Land record verification strengthens farm-income assessment."
        if ocr_passed
        else "RTC document should be reviewed before loan approval.",
    }