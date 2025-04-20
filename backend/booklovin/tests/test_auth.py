import pytest
from booklovin.core.config import pwd_context

# --- Test Setup ---

# Create a dummy user for testing
TEST_USERNAME = "dummy@dummy.com"
TEST_PASSWORD = "password"
HASHED_PASSWORD = pwd_context.hash(TEST_PASSWORD)


@pytest.mark.asyncio
async def test_login_success(client):
    """Test successful login and token retrieval."""
    response = await client.post(
        "/api/v1/login",  # Adjust URL prefix if needed
        data={"username": TEST_USERNAME, "password": TEST_PASSWORD},
    )
    assert response.status_code == 200
    json_response = response.json()
    assert "access_token" in json_response
    assert json_response["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_failure_incorrect_password(client):
    """Test login failure with incorrect password."""
    response = await client.post(
        "/api/v1/login",  # Adjust URL prefix if needed
        data={"username": TEST_USERNAME, "password": "incorrectpassword"},
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json().get("detail", "")


@pytest.mark.asyncio
async def test_login_failure_incorrect_username(client):
    """Test login failure with non-existent username."""
    response = await client.post(
        "/api/v1/login",  # Adjust URL prefix if needed
        data={"username": "nonexistent@user.com", "password": "password"},
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json().get("detail", "")


@pytest.mark.asyncio
async def test_access_protected_route_success(client):
    """Test accessing a protected route with a valid token."""
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
async def test_access_protected_route_no_token(client):
    """Test accessing a protected route without a token."""
    response = await client.get("/api/v1/test")  # Adjust URL prefix if needed
    assert response.status_code == 401  # Or 403 depending on FastAPI version/config
    assert "Not authenticated" in response.json().get("detail", "")


@pytest.mark.asyncio
async def test_access_protected_route_invalid_token(client):
    """Test accessing a protected route with an invalid token."""
    headers = {"Authorization": "Bearer invalidtoken"}
    response = await client.get(
        "/api/v1/test", headers=headers
    )  # Adjust URL prefix if needed
    assert response.status_code == 401
    # The exact detail message might vary based on JWTError
    assert "Could not validate credentials" in response.json().get(
        "detail", ""
    ) or "Invalid token" in response.json().get("detail", "")
