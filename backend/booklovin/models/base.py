from dataclasses import MISSING, fields, is_dataclass
from datetime import datetime, timezone
from typing import Any, Optional, Type, TypeVar, Union, cast
from uuid import uuid4

from booklovin.core.utils import dumps, loads
from pydantic import BaseModel, Field, SerializationInfo, field_serializer

FM = TypeVar("FM", bound="FlexModel")


class FlexModel(BaseModel):
    def update(self: FM, data: dict | FM):
        """Updates the instance from `data`, only allowing to change properties of the parent class"""
        assert self.__class__.__base__
        if isinstance(data, FlexModel):
            for k, v in data:
                if k in self.__dict__:
                    setattr(self, k, v)
        else:
            for prop in data.keys():  # type: ignore
                if prop in self.__dict__:
                    setattr(self, prop, data[prop])

    def to_json(self: FM) -> str:
        """Returns a JSON string"""
        return cast(str, dumps(self.model_dump()))

    @classmethod
    def from_json(kls: Type[FM], post_data: str) -> FM:
        """Get a new instance from a JSON string"""
        return kls.from_dict(loads(post_data))

    @classmethod
    def from_dict(kls: Type[FM], dict_obj: dict[str, Any], validate=True) -> FM:
        """Get a new instance from an Object"""
        if "creationTime" in dict_obj:
            dict_obj["creationTime"] = datetime.fromtimestamp(dict_obj["creationTime"], tz=timezone.utc)
        # TODO: ensure it works without validation
        # if validate:
        #     return kls.model_validate(dict_obj)
        # else:
        #     return kls.model_construct(dict_obj)  # type: ignore
        return kls.model_validate(dict_obj)

    @classmethod
    def from_new_model(kls: Type[FM], model: BaseModel, author: str) -> FM:
        d = model.model_dump()
        d["authorId"] = author
        return kls.from_dict(d)


class UserObject:
    uid: str = Field(default_factory=lambda: uuid4().hex)
    creationTime: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    authorId: str

    @field_serializer("creationTime")
    def to_json_creationTime(self, v: datetime, _: SerializationInfo) -> float:
        return v.timestamp()


def optional_fields(cls):
    """
    A class decorator that makes all fields of a class Optional.
    Works with regular classes and dataclasses.
    """
    if is_dataclass(cls):
        # Handle dataclasses
        for field in fields(cls):
            if field.type != Optional and field.default is MISSING and field.default_factory is MISSING:
                # Only modify fields that don't already have defaults
                field.type = Optional[field.type]
    else:
        # Handle regular classes
        annotations = getattr(cls, "__annotations__", {})
        new_annotations = {}

        for name, type_hint in annotations.items():
            # Skip if already Optional
            if getattr(type_hint, "__origin__", None) is Union and type(None) in getattr(type_hint, "__args__", ()):
                new_annotations[name] = type_hint
            else:
                new_annotations[name] = Optional[type_hint]

        cls.__annotations__ = new_annotations

    return cls
