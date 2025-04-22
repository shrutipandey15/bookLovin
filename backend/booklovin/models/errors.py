__all__ = ["ErrorCode", "UserError", "gen_error"]

from enum import IntEnum, auto

from pydantic import BaseModel


class ErrorCode(IntEnum):
    """Global website error codes"""

    FATAL = auto()
    USER_ALREADY_EXISTS = auto()


class UserError(BaseModel):
    error: ErrorCode
    message: str
    details: str


ERROR_MESSAGES = {
    ErrorCode.FATAL: "A fatal error occurred. Please try again later.",
    ErrorCode.USER_ALREADY_EXISTS: "A user with this email already exists.",
}


def gen_error(code: ErrorCode, details="N/A") -> UserError:
    return UserError(
        error=code,
        message=ERROR_MESSAGES.get(code, "N/A"),
        details=details,
    )
