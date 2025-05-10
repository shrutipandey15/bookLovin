from booklovin.models.errors import ErrorCode, UserError, gen_error

POST_NOT_FOUND = gen_error(ErrorCode.NOT_FOUND, details="Post not found")
ABUSIVE_USAGE = gen_error(ErrorCode.INVALID_PARAMETER, details="Abusive usage")
NOT_FOUND = gen_error(ErrorCode.NOT_FOUND, details="Post not found")
