from app.ocr.ocr_engine import extract_text_from_url
from app.ocr.rtc_parser import parse_rtc


def process_rtc_from_url(image_url: str):

    try:
        raw_text = extract_text_from_url(image_url)

        structured = parse_rtc(raw_text)

        return {
            "raw_text": raw_text,
            "structured_data": structured
        }

    except Exception as e:
        return {
            "error": str(e)
        }