import pytest
from conftest import assert_error, assert_success


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
    created_post_title = create_response.json()["title"]

    # Now retrieve the posts
    response = await aclient.get("/api/v1/posts/?s=0&e=10")
    assert_success(response)
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Check if the created post is in the list
    assert any(post["title"] == created_post_title for post in data)


@pytest.mark.asyncio
async def test_delete_post(aclient):
    """Test deleting a post."""
    # Create a post to delete
    payload = {
        "title": "Test Post to Delete",
        "content": "This post will be deleted.",
        "imageUrl": "delete_me.jpg",
    }
    create_response = await aclient.post("/api/v1/posts/", json=payload)
    assert_success(create_response)
    post_id = create_response.json()["uid"]

    # Delete the post
    delete_response = await aclient.delete(f"/api/v1/posts/{post_id}")
    assert_success(delete_response)  # Assuming 200/204 on successful delete

    # Check if the post is really deleted
    get_response = await aclient.get(f"/api/v1/posts/{post_id}")
    assert_error(get_response)  # Expecting 404 Not Found


@pytest.mark.asyncio
async def test_get_one_post(aclient):
    """Test retrieving a single post by its ID."""
    # Create a post
    payload = {
        "title": "Specific Post Title",
        "content": "Content of the specific post.",
        "imageUrl": "specific.jpg",
    }
    create_response = await aclient.post("/api/v1/posts/", json=payload)
    assert_success(create_response)
    created_post_data = create_response.json()
    post_id = created_post_data["uid"]

    # Retrieve the specific post
    response = await aclient.get(f"/api/v1/posts/{post_id}")
    assert_success(response)
    retrieved_post_data = response.json()
    assert retrieved_post_data["uid"] == post_id
    assert retrieved_post_data["title"] == payload["title"]
    assert retrieved_post_data["content"] == payload["content"]

    # Test retrieving a non-existent post
    non_existent_post_id = "non_existent_uid"
    response = await aclient.get(f"/api/v1/posts/{non_existent_post_id}")
    assert_error(response)


@pytest.mark.asyncio
async def test_read_recent_posts(aclient):
    """Test retrieving recent posts."""
    # Ensure at least one post exists for the test user
    await aclient.post("/api/v1/posts/", json={"title": "Recent Post", "content": "Content", "imageUrl": "recent.jpg"})

    response = await aclient.get("/api/v1/posts/recent")
    assert_success(response)
    data = response.json()
    assert isinstance(data, list)
    # Further assertions would depend on the definition of "recent"
    # For now, just check if it returns a list and contains posts if any were made
    if len(data) > 0:
        assert "title" in data[0]


@pytest.mark.asyncio
async def test_update_post(aclient):
    """Test updating an existing post."""
    # Create a post
    initial_payload = {
        "title": "Original Title",
        "content": "Original content.",
        "imageUrl": "original.jpg",
    }
    create_response = await aclient.post("/api/v1/posts/", json=initial_payload)
    assert_success(create_response)
    created_post_data = create_response.json()
    post_id = created_post_data["uid"]

    # Prepare update payload (must be a full Post model)
    update_payload = created_post_data.copy()  # Start with existing data
    update_payload["title"] = "Updated Title"
    update_payload["content"] = "Updated content."
    # Ensure all fields expected by Post model are present if necessary
    # For example, if 'likes' or 'createdAt' are mandatory in the PUT model

    response = await aclient.put(f"/api/v1/posts/{post_id}", json=update_payload)
    assert_success(response)  # Expecting 200/204

    # Verify the update
    get_response = await aclient.get(f"/api/v1/posts/{post_id}")
    assert_success(get_response)
    updated_post_data = get_response.json()
    assert updated_post_data["title"] == update_payload["title"]
    assert updated_post_data["content"] == update_payload["content"]


@pytest.mark.asyncio
async def test_like_post(aclient):
    """Test liking a post."""
    # Create a post
    payload = {
        "title": "Post to Like",
        "content": "Content of post to be liked.",
        "imageUrl": "likeable.jpg",
    }
    create_response = await aclient.post("/api/v1/posts/", json=payload)
    assert_success(create_response)
    created_post_data = create_response.json()
    post_id = created_post_data["uid"]
    initial_likes = created_post_data.get("likes", 0)  # Assuming 'likes' field exists

    # Like the post
    response = await aclient.put(f"/api/v1/posts/{post_id}/like")
    assert_success(response)  # Expecting 200/204

    # Verify the like
    get_response = await aclient.get(f"/api/v1/posts/{post_id}")
    assert_success(get_response)
    liked_post_data = get_response.json()
    assert liked_post_data.get("likes", 0) == initial_likes + 1


@pytest.mark.asyncio
async def test_read_popular_posts(aclient):
    """Test retrieving popular posts."""
    # Ensure at least one post exists
    await aclient.post("/api/v1/posts/", json={"title": "Popular Post", "content": "Content", "imageUrl": "popular.jpg"})
    response = await aclient.get("/api/v1/posts/popular")
    assert_success(response)
    data = response.json()
    assert isinstance(data, list)
    # Further assertions would depend on the definition of "popular"
    if len(data) > 0:
        assert "title" in data[0]
