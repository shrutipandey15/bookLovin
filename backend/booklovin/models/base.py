from datetime import datetime, timezone
from typing import Type, TypeVar

from booklovin.core.utils import dumps, loads
from pydantic import BaseModel

FM = TypeVar("FM", bound="FlexModel")


class FlexModel(BaseModel):
    def update(self: FM, data: dict):
        """Updates the instance from `data`, only allowing to change properties of the parent class"""
        assert self.__class__.__base__
        for prop in self.__class__.__base__.model_fields.keys():  # type: ignore
            if prop in data:
                setattr(self, prop, data[prop])

    def to_json(self: FM) -> str:
        """Returns a JSON string"""
        return dumps(self.model_dump())

    @classmethod
    def deserialize(kls: Type[FM], post_data: str) -> FM:
        """Get a new instance from a JSON string"""
        return kls.from_json(loads(post_data))

    @classmethod
    def from_json(kls: Type[FM], post: dict) -> FM:
        """Get a new instance from an Object"""
        post["creationTime"] = datetime.fromtimestamp(post["creationTime"], tz=timezone.utc)
        return kls.model_validate(post)
