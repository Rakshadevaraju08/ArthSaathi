from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rtc_service import process_rtc_from_url

router = APIRouter()

class RTCRequest(BaseModel):
    image_url: str

@router.post("/rtc/process")
def process_rtc(request: RTCRequest):
    return process_rtc_from_url(request.image_url)