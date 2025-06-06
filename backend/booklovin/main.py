"""Load routes for APIs and setup CORS for dev."""

import importlib
from contextlib import asynccontextmanager

from booklovin.core import config
from booklovin.services import database
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

providers = ("auth", "posts", "journal")
database_config = database.init(config.DB_TYPE)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database_config.setup(app)
    yield
    await database_config.teardown(app)


booklovin = FastAPI(lifespan=lifespan)


for api_provider in providers:
    try:
        module = importlib.import_module(f"booklovin.api.v1.{api_provider}")
        booklovin.include_router(module.router, prefix=f"/api/v1/{api_provider}")
    except ModuleNotFoundError as e:
        print(f"Error: Module booklovin.api.v1.{api_provider} not found: {e}")
        raise e
    except AttributeError as e:
        print(f"Error: {api_provider} module does not contain a 'router' attribute.")
        raise e

if config.DEBUG:
    booklovin.add_middleware(
        CORSMiddleware,
        allow_origins=[config.REACT_DEV_SERVER],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
