from app.ocr.ocr_engine import extract_text_from_url
from app.ocr.rtc_parser import parse_rtc

image_url = "https://img.indiafilings.com/learn/wp-content/uploads/2018/06/Image-5-Bhoomi-Karnataka-Land-Records-RTC-Online.jpg"

text = extract_text_from_url(image_url)

print("\nRAW TEXT:\n", text)

structured = parse_rtc(text)

print("\nSTRUCTURED DATA:\n", structured)