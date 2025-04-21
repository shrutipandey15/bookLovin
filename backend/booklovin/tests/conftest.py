import httpx
from booklovin.main import app
from httpx import ASGITransport
from pytest_asyncio import fixture
from test_auth import TEST_PASSWORD, TEST_USERNAME


@fixture(scope="function")
async def client():
    """Async client fixture."""
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://booklov.in") as client_instance:
        yield client_instance


@fixture(scope="function")
async def aclient():
    """Async (logged-in) client fixture."""
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://booklov.in") as client_instance:
        login_response = await client_instance.post(
            "/api/v1/auth/login",
            data={"username": TEST_USERNAME, "password": TEST_PASSWORD},
        )
        assert login_response.status_code == 200
        d = login_response.json()
        token = d["access_token"]

        client_instance.headers["Authorization"] = f"Bearer {token}"
        yield client_instance
