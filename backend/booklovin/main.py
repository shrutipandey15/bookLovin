"""Load routes for APIs and setup CORS if needed."""

from fastapi import FastAPI
import importlib
from fastapi.middleware.cors import CORSMiddleware
from booklovin.core import config

app = FastAPI()

providers = ("posts", "auth")

for api_provider in providers:
    try:
        module = importlib.import_module(f"booklovin.api.v1.{api_provider}")
        app.include_router(module.router, prefix=f"/api/v1/{api_provider}")
    except ModuleNotFoundError:
        print(f"Error: Module booklovin.api.v1.{api_provider} not found!")
    except AttributeError:
        print(f"Error: {api_provider} module does not contain a 'router' attribute.")

if config.DEBUG:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[config.REACT_DEV_SERVER],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
