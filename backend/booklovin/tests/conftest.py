import httpx
import pytest
from asgi_lifespan import LifespanManager
from booklovin.core.config import TEST_PASSWORD, TEST_USERNAME, get_test_password
from booklovin.main import booklovin as app
from booklovin.models.users import UserRole
from httpx import ASGITransport
from pytest_asyncio import fixture

user_data = {
    "name": "Alice",
    "password": get_test_password(),
    "email": TEST_USERNAME,
    "description": "Test user account",
    "role": UserRole.STANDARD,
    "link": "",
    "uid": "alice-unique-id",
    "location": "SolarSystem/Earth",
    "active": True,
}


@fixture()
async def client():
    """Async client fixture."""
    async with LifespanManager(app) as manager:
        async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://booklov.in") as client_instance:
            yield client_instance


@fixture()
async def aclient():
    """Async (logged-in) client fixture."""
    async with LifespanManager(app) as manager:
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


@pytest.fixture(scope="module", autouse=True)
def database_setup():
    """
    Fixture to clear the users collection and add the default test user ONCE per session.
    """

    # Create the test user document
    from booklovin.services import database

    database.test_setup.setup(user_data)  # type: ignore
    yield
    # Optional teardown code here if needed


def assert_error(request):
    assert request.status_code == 200
    assert request.json()["error"]


def assert_success(request):
    assert request.status_code == 200
    if request.text == "null":  # for APIs returning None
        return

    assert "error" not in request.json()
