from uuid import uuid4


def generate_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


def add_unique_id(prefix: str, data: dict) -> dict:
    return {"unique_id": generate_id(prefix), **data}