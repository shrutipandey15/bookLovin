from pytest_asyncio import fixture

import httpx
from httpx import ASGITransport
from booklovin.main import app


@fixture(scope="function")
async def client():
    """Async client fixture."""
    async with httpx.AsyncClient(
        transport=ASGITransport(app=app), base_url="http://booklov.in"
    ) as client_instance:
        yield client_instance
