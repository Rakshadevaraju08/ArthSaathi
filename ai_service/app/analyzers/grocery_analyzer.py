from app.analyzers.common import band_from_thresholds


def analyze_grocery(details: dict) -> dict:
    return {
        "track": "Grocery Shop",
        "business_scale": band_from_thresholds(
            details["initial_business_investment"],
            ((74999, "Micro Store"), (199999, "Growing Store"), (999999999, "Established Store")),
        ),
        "inventory_cash_cycle": {
            "Weekly": "Fast",
            "Monthly": "Moderate",
        }[details["inventory_turn_cycle"]],
        "supplier_credit_dependency": {
            "Yes": "Present",
            "No": "Low",
        }[details["supplier_credit_terms"]],
        "dashboard_signal": "Inventory cycle and supplier credit exposure available.",
    }