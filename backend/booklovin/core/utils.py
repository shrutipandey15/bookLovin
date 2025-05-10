from typing import Any

from orjson import dumps as orjson_dumps
from orjson import loads as orjson_loads


def dumps(data: Any) -> str:
    return orjson_dumps(data).decode("utf-8")


def loads(data: str | bytes) -> Any:
    if hasattr(data, "decode"):
        data = data.decode("utf-8")
    return orjson_loads(data)


def isError(data) -> bool:
    return bool(getattr(data, "error", False))


def red(txt):
    "return a ANSI colored string"
    return f"\033[91m{txt}\033[0m"


def blue(txt):
    "return a ANSI colored string"
    return f"\033[94m{txt}\033[0m"


def green(txt):
    "return a ANSI colored string"
    return f"\033[92m{txt}\033[0m"


def yellow(txt):
    "return a ANSI colored string"
    return f"\033[93m{txt}\033[0m"
