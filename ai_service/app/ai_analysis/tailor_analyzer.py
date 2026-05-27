def analyze_tailor_profile(details: dict) -> dict:
    machine_count = details["machinery_asset_count"]
    weekly_capacity = details["weekly_order_throughput_capacity"]
    deposit_collection = details["collects_advance_fabric_deposits"]

    if machine_count >= 3:
        asset_band = "Strong Asset Base"
    elif machine_count >= 1:
        asset_band = "Basic Asset Base"
    else:
        asset_band = "No Machinery Asset"

    if weekly_capacity >= 50:
        throughput_band = "High Capacity"
    elif weekly_capacity >= 20:
        throughput_band = "Stable Capacity"
    else:
        throughput_band = "Low Capacity"

    working_capital_buffer = (
        "Protected" if deposit_collection == "Yes" else "Unprotected"
    )

    return {
        "track": "Tailor",
        "machinery_asset_band": asset_band,
        "weekly_throughput_band": throughput_band,
        "working_capital_buffer": working_capital_buffer,
        "insight": "Advance deposits reduce fabric purchase cash-flow pressure."
        if deposit_collection == "Yes"
        else "Encourage advance deposits to reduce cash-flow pressure.",
    }