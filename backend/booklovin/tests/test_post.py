"""Tests for the post API endpoints."""

import pytest


@pytest.mark.asyncio
async def test_create_post(client):
    """Test creating a new post."""
    payload = {"title": "Test Book Post", "content": "This is a test post about a book.", "imageUrl": "test.jpg", "authorId": "xxx"}
    response = await client.post("/api/v1/posts/", json=payload)

    assert response.status_code == 201
    assert "id" in response.json()


@pytest.mark.asyncio
async def test_get_post(client):
    """Test retrieving posts."""
    # Create a post first to ensure there's data to retrieve
    payload = {"title": "Test Book Post GET", "content": "Sample content for GET test", "imageUrl": "sample.jpg", "authorId": "xxx"}
    create_response = await client.post("/api/v1/posts/", json=payload)
    assert create_response.status_code == 201

    # Now retrieve the posts
    response = await client.get("/api/v1/posts/")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Check if the created post is in the list
    assert any(post["title"] == "Test Book Post GET" for post in data)
