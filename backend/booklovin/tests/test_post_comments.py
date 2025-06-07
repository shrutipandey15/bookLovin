import pytest
import pytest_asyncio
from booklovin.tests.conftest import assert_success, assert_error


@pytest_asyncio.fixture
async def newpost(aclient):
    """Test creating a new post."""

    payload = {
        "title": "Test Book Post",
        "content": "This is a test post about a book.",
        "imageUrl": "test.jpg",
    }
    response = await aclient.post("/api/v1/posts/", json=payload)

    assert_success(response)
    data = response.json()
    post_id = data["uid"]
    yield post_id
    # remove post
    await aclient.delete(f"/api/v1/posts/{post_id}")


@pytest.mark.asyncio
async def test_add_comment_to_post(aclient, newpost):
    """Test adding a comment to a post."""
    print(newpost)
    data = {"postId": newpost, "content": "blah blah"}
    ret = await aclient.post(f"/api/v1/posts/{newpost}/comments", json=data)
    assert_success(ret)


@pytest.mark.asyncio
async def test_get_comments_for_post(aclient, newpost):
    """Test retrieving comments for a post."""
    # First add a comment
    comment_data = {"postId": newpost, "content": "This is a test comment"}
    add_response = await aclient.post(f"/api/v1/posts/{newpost}/comments", json=comment_data)
    assert_success(add_response)

    # Get comments
    get_response = await aclient.get(f"/api/v1/posts/{newpost}/comments")
    assert_success(get_response)

    comments = get_response.json()
    assert isinstance(comments, list)
    assert len(comments) >= 1
    assert any(comment["content"] == "This is a test comment" for comment in comments)


@pytest.mark.asyncio
async def test_comment_on_nonexistent_post(aclient):
    """Test adding a comment to a post that doesn't exist."""
    fake_post_id = "nonexistent_post_id"
    comment_data = {"postId": fake_post_id, "content": "This should fail"}

    response = await aclient.post(f"/api/v1/posts/{fake_post_id}/comments", json=comment_data)
    assert_error(response)


@pytest.mark.asyncio
async def test_delete_one_comments_for_post(aclient, newpost):
    """Test deleting one comments for a post."""
    # Add comments
    comment_data = {"postId": newpost, "content": "Comment to be deleted"}
    await aclient.post(f"/api/v1/posts/{newpost}/comments", json=comment_data)

    # get the comments
    get_response = (await aclient.get(f"/api/v1/posts/{newpost}/comments")).json()
    comment_id = get_response[0]["uid"]

    # Delete all comments
    delete_response = await aclient.delete(f"/api/v1/posts/{newpost}/comments/{comment_id}")
    assert_success(delete_response)

    # Verify comments were deleted
    get_response = await aclient.get(f"/api/v1/posts/{newpost}/comments")
    assert_success(get_response)
    comments = get_response.json()
    assert isinstance(comments, list)
    assert len(comments) == 0
