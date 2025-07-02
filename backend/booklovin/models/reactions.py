from pydantic import BaseModel

class ReactionRequest(BaseModel):
    reaction: str