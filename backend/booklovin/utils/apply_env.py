"""Loads the .env file in the current process.
Purposely executes on import and starts with an "a" to maximize
the changes of running as early as possible without breaking style."""

from dotenv import load_dotenv

load_dotenv()
