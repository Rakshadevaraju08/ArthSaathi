from sqlalchemy import Column, Integer, String, Text
from app.database.db import Base


class RTCRecord(Base):
    __tablename__ = "rtc_records"

    id = Column(Integer, primary_key=True, index=True)

    owner_name = Column(String, nullable=True)
    survey_number = Column(String, nullable=True)
    village = Column(String, nullable=True)
    land_area = Column(String, nullable=True)

    raw_text = Column(Text)
    ai_analysis = Column(Text)