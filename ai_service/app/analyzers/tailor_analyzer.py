from app.analyzers.common import band_from_thresholds


def analyze_tailor(details: dict) -> dict:
    return {
        "track": "Tailor",
        "machinery_asset_band": band_from_thresholds(
            details["machinery_asset_count"],
            ((0, "No Machinery Asset"), (2, "Basic Asset Base"), (999999999, "Strong Asset Base")),
        ),
        "weekly_throughput_band": band_from_thresholds(
            details["weekly_order_throughput_capacity"],
            ((19, "Low Capacity"), (49, "Stable Capacity"), (999999999, "High Capacity")),
        ),
        "working_capital_buffer": {
            "Yes": "Protected",
            "No": "Unprotected",
        }[details["collects_advance_fabric_deposits"]],
        "dashboard_signal": "Machine assets and weekly order capacity available.",
    }