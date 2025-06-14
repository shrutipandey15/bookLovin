import typing
from datetime import datetime
from typing import Any

import pydantic
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


def convert_datetime_fields(data: dict, model: typing.Type[pydantic.BaseModel]) -> dict:
    """
    Convert datetime fields from string/float representation back to datetime objects.

    Args:
        data: The dictionary containing serialized data
        model: The Pydantic model class to use for field type information

    Returns:
        Dictionary with datetime fields properly converted
    """
    result = data.model_copy()
    for field_name, field in model.model_fields.items():
        if field_name in result:
            # Check if the field type is datetime
            if (
                field.annotation == datetime
                or typing.get_origin(field.annotation) is typing.Union
                and datetime in typing.get_args(field.annotation)
            ):
                # Handle float timestamp
                if isinstance(result[field_name], (int, float)):
                    result[field_name] = datetime.fromtimestamp(result[field_name])
                # Handle ISO format string
                elif isinstance(result[field_name], str):
                    try:
                        result[field_name] = datetime.fromisoformat(result[field_name].replace("Z", "+00:00"))
                    except ValueError:
                        pass  # Not a valid datetime string
    return result
