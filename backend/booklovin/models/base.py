from datetime import datetime, timezone
from typing import Any, Type, TypeVar
from uuid import uuid4

from booklovin.core.utils import dumps, loads
from pydantic import BaseModel, Field, SerializationInfo, field_serializer

FM = TypeVar("FM", bound="FlexModel")


class FlexModel(BaseModel):
    def update(self: FM, data: dict):
        """Updates the instance from `data`, only allowing to change properties of the parent class"""
        assert self.__class__.__base__
        for prop in self.__class__.__base__.model_fields.keys():  # type: ignore
            if prop in data:
                setattr(self, prop, data[prop])

    def serialize(self: FM) -> str:
        """Returns a JSON string"""
        return dumps(self.model_dump())

    @classmethod
    def deserialize(kls: Type[FM], post_data: str) -> FM:
        """Get a new instance from a JSON string"""
        return kls.from_json(loads(post_data))

    @classmethod
    def from_json(kls: Type[FM], dict_obj: dict[str, Any], validate=True) -> FM:
        """Get a new instance from an Object"""
        if "creationTime" in dict_obj:
            dict_obj["creationTime"] = datetime.fromtimestamp(dict_obj["creationTime"], tz=timezone.utc)
        if validate:
            return kls.model_validate(dict_obj)
        else:
            return kls.model_construct(dict_obj)  # type: ignore

    @classmethod
    def from_new_model(kls: Type[FM], model: BaseModel, author: str) -> FM:
        d = model.model_dump()
        d["authorId"] = author
        return kls.from_json(d)


class UserObject:
    uid: str = Field(default_factory=lambda: uuid4().hex)
    creationTime: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    authorId: str

    @field_serializer("creationTime")
    def serialize_creationTime(self, v: datetime, _: SerializationInfo) -> float:
        return v.timestamp()
