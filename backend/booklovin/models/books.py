from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from .base import UserObject, FlexModel

class ShelfStatus(str, Enum):
    WANT_TO_READ = "want_to_read"
    READING = "reading"
    READ = "read"

class Book(BaseModel):
    ol_key: str = Field(..., alias="key")
    title: str
    author_names: Optional[List[str]] = Field(None, alias="author_name")
    cover_id: Optional[int] = Field(None, alias="cover_i")
    gutenberg_id: Optional[List[str]] = Field(None, alias="id_project_gutenberg")
    archive_id: Optional[List[str]] = Field(None, alias="id_internet_archive")

class BookSearchResult(BaseModel):
    docs: List[Book]

class ShelfItemCreate(FlexModel):
    ol_key: str
    title: str
    status: ShelfStatus
    cover_id: Optional[int] = None
    author_names: Optional[List[str]] = None

class ShelfItem(UserObject, FlexModel):
    """
    Represents a book on a user's shelf in our database.
    Inherits uid, creationTime, authorId from UserObject.
    """
    ol_key: str
    status: ShelfStatus

    title: str
    cover_id: Optional[int]
    author_names: Optional[List[str]]