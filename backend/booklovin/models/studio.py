# In backend/booklovin/models/studio.py

from pydantic import BaseModel, Field
from datetime import datetime, timezone

# 1. Import UserObject and FlexModel, NOT PyObjectId
from booklovin.models.base import UserObject, FlexModel

class ImagePrompt(BaseModel):
    prompt: str = Field(..., min_length=1)

class CreationSaveRequest(BaseModel):
    imageUrl: str = Field(...)
    prompt: str = Field(...)
    bookId: str = Field(...)

# 2. Make CreationData inherit from UserObject and FlexModel
class CreationData(UserObject, FlexModel):
    # uid, creationTime, and authorId are now inherited from UserObject
    
    book_id: str = Field(...)  # Assuming bookId is an OpenLibrary key (string)
    prompt: str = Field(...)
    image_url: str = Field(...)
    
    # We rename 'created_at' to match the 'creationTime' from UserObject
    # The 'default_factory' is already in UserObject, so we don't need it here.

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "uid": "a1b2c3d4e5", # from UserObject
                "authorId": "f6g7h8i9j0", # from UserObject
                "creationTime": 1678886400.0, # from UserObject
                "book_id": "OL12345M",
                "prompt": "A sad robot reading a book",
                "image_url": "http://example.com/image.png",
            }
        }