__all__ = ["ErrorCode", "UserError", "gen_error"]

from enum import IntEnum, auto

from pydantic import BaseModel


class ErrorCode(IntEnum):
    """Global website error codes"""

    FATAL = 1
    NOT_FOUND = auto()
    INVALID_PARAMETER = auto()
    ALREADY_EXISTS = auto()
    PERMISSION_DENIED = auto()


class UserError(BaseModel):
    error: ErrorCode
    message: str
    details: str


ERROR_MESSAGES = {
    ErrorCode.FATAL: "A fatal error occurred. Please try again later.",
    ErrorCode.ALREADY_EXISTS: "Existing entity.",
    ErrorCode.NOT_FOUND: "Entity not found.",
    ErrorCode.INVALID_PARAMETER: "Invalid parameter provided.",
}


def gen_error(code: ErrorCode, details="N/A") -> UserError:
    return UserError(
        error=code,
        message=ERROR_MESSAGES.get(code, "N/A"),
        details=details,
    )
