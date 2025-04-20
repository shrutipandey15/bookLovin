from pydantic import BaseModel

class PostCreate(BaseModel):
    title: str
    content: str
    image_url: str

class PostResponse(PostCreate):
    id: int