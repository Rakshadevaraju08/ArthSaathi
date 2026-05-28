from app.analyzers.common import band_from_thresholds


def analyze_farmer(details: dict) -> dict:
    return {
        "track": "Farmer",
        "crop_mix": details["primary_harvest_crops"],
        "input_cost_band": band_from_thresholds(
            details["monthly_cost_of_inputs"],
            ((7999, "Low"), (20000, "Medium"), (999999999, "High")),
        ),
        "document_confidence": {
            True: "Verified",
            False: "Needs Manual Review",
        }[details["rtc_land_record_ocr_passed"]],
        "dashboard_signal": "Farm seasonality and RTC verification available.",
    }