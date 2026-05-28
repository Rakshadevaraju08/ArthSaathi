from app.utils.id_generator import generate_id


def success_response(data: dict, message: str) -> dict:
    return {
        "request_id": generate_id("request"),
        "success": True,
        "message": message,
        "data": data,
    }