from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from .base import UserObject, FlexModel

class ShelfStatus(str, Enum):
    WANT_TO_READ = "want_to_read"
    READING = "reading"
    READ = "read"
    DNF = "did_not_finish"

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

    page_count: Optional[int] = None     
    progress_percent: int = Field(default=0)
    is_favorite: bool = Field(default=False)
    sort_order: int = Field(default=0)

class UpdateBookProgressRequest(BaseModel):
    progress: int = Field(..., ge=0, le=100)

class UpdateBookFavoriteRequest(BaseModel):
    is_favorite: bool
class UpdateShelfOrderRequest(BaseModel):
    ordered_keys: List[str]