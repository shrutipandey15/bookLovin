from fastapi import FastAPI

from .api.v1 import posts
from .api.v1 import auth

app = FastAPI()

# NOTE:
# https://www.notion.so/1db4cee15df381e19c04c0641da536b4?v=1db4cee15df381fa8ce8000cdf16a3de

app.include_router(posts.router, prefix="/api/v1/posts")
app.include_router(auth.router, prefix="/api/v1/auth")
