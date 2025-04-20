"""Tests for the post API endpoints."""

import pytest
import httpx
from booklovin.main import app
from settings import getAsyncClientParams

Client = lambda: httpx.AsyncClient(**getAsyncClientParams(app=app))


@pytest.mark.asyncio
async def test_create_post():
    """Test creating a new post."""
    payload = {
        "title": "Test Book Post",
        "content": "This is a test post about a book.",
        "image_url": "test.jpg",
    }
    async with Client() as client:
        response = await client.post("/api/v1/posts/", json=payload)

        assert response.status_code == 201
        assert "id" in response.json()


@pytest.mark.asyncio
async def test_get_post():
    """Test retrieving posts."""
    # Create a post first to ensure there's data to retrieve
    payload = {
        "title": "Test Book Post GET",
        "content": "Sample content for GET test",
        "image_url": "sample.jpg",
    }
    async with Client() as client:
        create_response = await client.post("/api/v1/posts/", json=payload)
        assert create_response.status_code == 201
        created_post_id = create_response.json()["id"]

        # Now retrieve the posts
        response = await client.get("/api/v1/posts/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Check if the created post is in the list
        assert any(post["title"] == "Test Book Post GET" for post in data)
