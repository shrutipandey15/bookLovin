from fastapi import FastAPI
import importlib
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Load DEBUG setting from environment variable (set to 'True' or 'False' in your environment)
DEBUG = os.getenv("DEBUG", "False").lower() == "true"  # defaults to False if not set

if DEBUG:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

providers = ("posts", "auth")

for api_provider in providers:
    try:
        module = importlib.import_module(f"booklovin.api.v1.{api_provider}")
        app.include_router(module.router, prefix=f"/api/v1/{api_provider}")
    except ModuleNotFoundError:
        print(f"Error: Module booklovin.api.v1.{api_provider} not found!")
    except AttributeError:
        print(f"Error: {api_provider} module does not contain a 'router' attribute.")
