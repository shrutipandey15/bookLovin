import booklovin.utils.apply_env  # noqa: F401
import httpx
from booklovin.core.config import DB_NAME, MONGO_SERVER, TEST_PASSWORD, TEST_USERNAME, get_test_password
from booklovin.main import app
from booklovin.models.users import UserRole
from httpx import ASGITransport
from pytest_asyncio import fixture


@fixture()
async def client():
    """Async client fixture."""
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://booklov.in") as client_instance:
        yield client_instance


@fixture()
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


def pytest_configure():
    """
    Fixture to clear the users collection and add the default test user ONCE per session.
    WARNING: Tests will share database state. Prefer scope="function" for isolation.
    """
    import pymongo

    mymongo = pymongo.MongoClient(*MONGO_SERVER)
    db = mymongo[DB_NAME]

    users_collection = db["users"]
    users_collection.delete_many({})
    db["posts"].delete_many({})

    # Create the test user document
    test_user_data = {
        "name": "Alice",
        "password": get_test_password(),
        "email": TEST_USERNAME,
        "description": "Test user account",
        "role": UserRole.STANDARD,
        "link": "",
        "location": "SolarSystem/Earth",
        "active": True,
    }

    users_collection.insert_one(test_user_data)
