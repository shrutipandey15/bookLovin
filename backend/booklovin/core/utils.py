def isError(data) -> bool:
    return bool(getattr(data, "error", False))
