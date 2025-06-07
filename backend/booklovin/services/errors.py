from booklovin.models.errors import ErrorCode, gen_error

ABUSIVE_USAGE = gen_error(ErrorCode.INVALID_PARAMETER, details="Abusive usage")
FORBIDDEN = gen_error(ErrorCode.INVALID_PARAMETER, details="Forbidden")
NOT_FOUND = gen_error(ErrorCode.NOT_FOUND)
# Post specific
POST_NOT_FOUND = gen_error(ErrorCode.NOT_FOUND, details="Post not found")
