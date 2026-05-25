import re

def parse_rtc(text: str):

    data = {
        "owner_name": None,
        "survey_number": None,
        "village": None,
        "land_area": None
    }

    if not text:
        return data

    text_lower = text.lower()
    words = text.split()

    # ---------------- SURVEY NUMBER ----------------
    match = re.search(r"\d{1,4}/\d{1,4}[a-zA-Z]?", text)
    if match:
        data["survey_number"] = match.group()

    # ---------------- LAND AREA ----------------
    area = re.search(r"(\d+(\.\d+)?)\s*(acre|acres|hectare|ha|gunta)", text_lower)
    if area:
        data["land_area"] = area.group()

    # ---------------- VILLAGE ----------------
    for i in range(len(words) - 1):
        if "village" in words[i].lower():
            data["village"] = words[i + 1]
            break

    # ---------------- OWNER NAME ----------------
    keywords = ["name", "owner", "mr", "mrs"]
    for i in range(len(words) - 1):
        if words[i].lower() in keywords:
            candidate = words[i + 1]
            if candidate.isalpha():
                data["owner_name"] = candidate
                break

    return data