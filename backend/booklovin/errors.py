"""Error codes shared across the website"""

from enum import auto, IntEnum


class ErrorCode(IntEnum):
    """Global website error codes"""

    FATAL = auto()
    USER_ALREADY_EXISTS = auto()


ERROR_MESSAGES = {
    ErrorCode.FATAL: "A fatal error occurred. Please try again later.",
    ErrorCode.USER_ALREADY_EXISTS: "A user with this email already exists.",
}


def gen_error(code: ErrorCode, details="N/A"):
    return {
        "code": code,
        "message": ERROR_MESSAGES.get(code, "N/A"),
        "details": details,
    }
