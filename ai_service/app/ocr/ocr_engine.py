import cv2
import pytesseract
import requests
import numpy as np
from app.core.constants import TESSERACT_PATH

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def download_image(url: str):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if img is None:
            raise Exception("Image decode failed")

        return img

    except Exception as e:
        raise Exception(f"Image download failed: {str(e)}")


def preprocess(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    gray = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31, 2
    )

    return gray


def extract_text_from_url(url: str):
    img = download_image(url)

    processed = preprocess(img)

    text = pytesseract.image_to_string(processed, config="--psm 6")

    text = text.replace("\n", " ")
    text = " ".join(text.split())

    return text