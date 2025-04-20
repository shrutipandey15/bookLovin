import pytest
import httpx
from passlib.context import CryptContext
from booklovin.main import app
from settings import getAsyncClientParams

# Adjust this import to where your FastAPI app instance is defined
# from booklovin.main import app
# If app is created in __init__.py or similar, adjust accordingly
# Example assuming app is in booklovin/app.py
try:
    from booklovin.app import app  # Adjust this import path
except ImportError:
    # Fallback if the structure is different, you might need to create the app instance here
    from fastapi import FastAPI
    from booklovin.api.v1 import auth  # Import your auth router

    app = FastAPI()
    app.include_router(auth.router, prefix="/api/v1")  # Assuming prefix

# Import the dependency function to override it
from booklovin.api.v1.auth import get_user
from booklovin.core.config import pwd_context
from booklovin.models.users import UserLogin as User

# --- Test Setup ---

# Create a dummy user for testing
TEST_USERNAME = "dummy@dummy.com"
TEST_PASSWORD = "password"
HASHED_PASSWORD = pwd_context.hash(TEST_PASSWORD)

dummy_user_obj = User(email=TEST_USERNAME, password=HASHED_PASSWORD)


# Override the dependency: Simulate database lookup
async def override_get_user(username: str):
    if username == TEST_USERNAME:
        return dummy_user_obj  # Return the User model instance
    return None


# Apply the dependency override to the app
app.dependency_overrides[get_user] = override_get_user

# Create the test client
Client = lambda: httpx.AsyncClient(**getAsyncClientParams(app=app))

# --- Test Cases ---


@pytest.mark.asyncio
async def test_login_success():
    """Test successful login and token retrieval."""
    async with Client() as client:
        response = await client.post(
            "/api/v1/login",  # Adjust URL prefix if needed
            data={"username": TEST_USERNAME, "password": TEST_PASSWORD},
        )
        assert response.status_code == 200
        json_response = response.json()
        assert "access_token" in json_response
        assert json_response["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_failure_incorrect_password():
    """Test login failure with incorrect password."""
    async with Client() as client:
        response = await client.post(
            "/api/v1/login",  # Adjust URL prefix if needed
            data={"username": TEST_USERNAME, "password": "incorrectpassword"},
        )
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json().get("detail", "")


@pytest.mark.asyncio
async def test_login_failure_incorrect_username():
    """Test login failure with non-existent username."""
    async with Client() as client:
        response = await client.post(
            "/api/v1/login",  # Adjust URL prefix if needed
            data={"username": "nonexistent@user.com", "password": "password"},
        )
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json().get("detail", "")


@pytest.mark.asyncio
async def test_access_protected_route_success():
    """Test accessing a protected route with a valid token."""
    async with Client() as client:
        # 1. Login to get the token
        login_response = await client.post(
            "/api/v1/login", data={"username": TEST_USERNAME, "password": TEST_PASSWORD}
        )
        assert login_response.status_code == 200
        d = login_response.json()
        token = d["access_token"]

        # 2. Access the protected route with the token
        headers = {"Authorization": f"Bearer {token}"}
        test_response = await client.get(
            "/api/v1/test", headers=headers
        )  # Adjust URL prefix if needed

        assert test_response.status_code == 200
        json_response = test_response.json()
        assert json_response["email"] == TEST_USERNAME


@pytest.mark.asyncio
async def test_access_protected_route_no_token():
    """Test accessing a protected route without a token."""
    async with Client() as client:
        response = await client.get("/api/v1/test")  # Adjust URL prefix if needed
        assert response.status_code == 401  # Or 403 depending on FastAPI version/config
        assert "Not authenticated" in response.json().get("detail", "")


@pytest.mark.asyncio
async def test_access_protected_route_invalid_token():
    """Test accessing a protected route with an invalid token."""
    async with Client() as client:
        headers = {"Authorization": "Bearer invalidtoken"}
        response = await client.get(
            "/api/v1/test", headers=headers
        )  # Adjust URL prefix if needed
        assert response.status_code == 401
        # The exact detail message might vary based on JWTError
        assert "Could not validate credentials" in response.json().get(
            "detail", ""
        ) or "Invalid token" in response.json().get("detail", "")
