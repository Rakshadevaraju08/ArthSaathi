def analyze_grocery_profile(details: dict) -> dict:
    investment = details["initial_business_investment"]
    supplier_credit = details["supplier_credit_terms"]
    turn_cycle = details["inventory_turn_cycle"]

    if investment >= 200000:
        scale = "Established Store"
    elif investment >= 75000:
        scale = "Growing Store"
    else:
        scale = "Micro Store"

    cash_cycle = "Fast" if turn_cycle == "Weekly" else "Moderate"
    credit_dependency = "Present" if supplier_credit == "Yes" else "Low"

    return {
        "track": "Grocery Shop",
        "business_scale": scale,
        "inventory_cash_cycle": cash_cycle,
        "supplier_credit_dependency": credit_dependency,
        "insight": "Weekly restocking usually indicates active shop-floor movement."
        if turn_cycle == "Weekly"
        else "Monthly restocking may need closer inventory planning.",
    }