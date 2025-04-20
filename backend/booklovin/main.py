from fastapi import FastAPI

from .api.v1 import posts

app = FastAPI()

app.include_router(posts.router, prefix="/api/v1/posts")
