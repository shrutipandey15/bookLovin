from fastapi import FastAPI
import importlib

app = FastAPI()

# NOTE:
# Initial API reference:
# https://www.notion.so/1db4cee15df381e19c04c0641da536b4?v=1db4cee15df381fa8ce8000cdf16a3de

providers = ("posts", "auth")

for api_provider in providers:
    module = importlib.import_module(f"booklovin.api.v1.{api_provider}")
    app.include_router(module.router, prefix=f"/api/v1/{api_provider}")
