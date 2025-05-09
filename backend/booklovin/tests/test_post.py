"""Tests for the post API endpoints."""

import pytest
from conftest import assert_error, assert_success


@pytest.mark.asyncio
async def test_create_post(aclient):
    """Test creating a new post."""

    payload = {
        "title": "Test Book Post",
        "content": "This is a test post about a book.",
        "imageUrl": "test.jpg",
    }
    response = await aclient.post("/api/v1/posts/", json=payload)

    assert_success(response)
    assert "uid" in response.json()


@pytest.mark.asyncio
async def test_get_post(aclient):
    """Test retrieving posts."""
    # Create a post first to ensure there's data to retrieve
    payload = {
        "title": "Test Book Post GET",
        "content": "Sample content for GET test",
        "imageUrl": "sample.jpg",
    }
    create_response = await aclient.post("/api/v1/posts/", json=payload)
    assert_success(create_response)

    # Now retrieve the posts
    response = await aclient.get("/api/v1/posts/?s=0&e=10")
    assert_success(response)
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Check if the created post is in the list
    assert any(post["title"] == "Test Book Post GET" for post in data)


@pytest.mark.asyncio
async def test_delete_post(aclient):
    """Test deleting a post."""
    # get one post
    response = await aclient.get("/api/v1/posts/?s=0&e=10")
    assert_success(response)
    posts = response.json()
    assert len(posts) > 0
    post_id = posts[0]["uid"]
    # Delete the post
    await aclient.delete(f"/api/v1/posts/{post_id}")
    # Check if the post is really deleted
    response = await aclient.get(f"/api/v1/posts/{post_id}")
    assert_error(response)
