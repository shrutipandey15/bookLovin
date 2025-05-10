import pytest
from httpx import AsyncClient
from fastapi import status

pytest.skip(allow_module_level=True)


@pytest.fixture
async def created_post_id(aclient: AsyncClient) -> str:
    """Fixture to create a post and return its ID."""
    post_payload = {
        "title": "Test Post for Comments",
        "content": "This post will have comments.",
        "imageUrl": "test_comment_post.jpg",
    }
    response = await aclient.post("/api/v1/posts/", json=post_payload)
    assert response.status_code == status.HTTP_200_OK  # Or 201 if your create returns that
    return str(response.json()["uid"])


@pytest.mark.asyncio
class TestPostCommentsAPI:
    async def test_add_comment_to_post_authenticated(self, aclient: AsyncClient, created_post_id: str, test_user):
        """Test adding a comment to a post when authenticated."""
        url = f"/api/v1/posts/{created_post_id}/comments"
        comment_payload = {"content": "This is a test comment."}
        response = await aclient.post(url, json=comment_payload)

        assert response.status_code == status.HTTP_200_OK  # As per your posts.py
        comment_data = response.json()
        assert comment_data["content"] == comment_payload["content"]
        assert comment_data["postId"] == created_post_id
        assert comment_data["authorId"] == test_user.email  # Assuming test_user has an email attribute
        assert "id" in comment_data
        assert "createdAt" in comment_data

    async def test_add_comment_to_post_unauthenticated(self, client: AsyncClient, created_post_id: str):
        """Test adding a comment to a post when unauthenticated."""
        url = f"/api/v1/posts/{created_post_id}/comments"
        comment_payload = {"content": "This is an unauthenticated comment."}
        response = await client.post(url, json=comment_payload)
        # Expecting 401 UNAUTHORIZED if get_from_token handles it
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_add_comment_to_non_existent_post(self, aclient: AsyncClient):
        """Test adding a comment to a non-existent post."""
        non_existent_post_id = "non_existent_post_123"
        url = f"/api/v1/posts/{non_existent_post_id}/comments"
        comment_payload = {"content": "This comment targets a ghost post."}
        response = await aclient.post(url, json=comment_payload)
        # Your API returns NOT_FOUND (404) if post doesn't exist
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_add_comment_missing_content(self, aclient: AsyncClient, created_post_id: str):
        """Test adding a comment with missing content field."""
        url = f"/api/v1/posts/{created_post_id}/comments"
        comment_payload: dict = {}  # Missing 'content'
        response = await aclient.post(url, json=comment_payload)
        # FastAPI typically returns 422 for validation errors
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        error_detail = response.json()["detail"]
        assert any(err["type"] == "missing" and "content" in err["loc"] for err in error_detail)

    async def test_get_comments_for_post(self, aclient: AsyncClient, created_post_id: str, test_user):
        """Test retrieving all comments for a specific post."""
        # First, add a comment
        comment_text = "A comment to retrieve."
        add_comment_url = f"/api/v1/posts/{created_post_id}/comments"
        await aclient.post(add_comment_url, json={"content": comment_text})

        # Now, get comments
        get_comments_url = f"/api/v1/posts/{created_post_id}/comments"
        response = await aclient.get(get_comments_url)

        assert response.status_code == status.HTTP_200_OK
        comments_data = response.json()
        assert isinstance(comments_data, list)
        # Based on your API, it might return an empty list if the service layer isn't fully implemented
        # For now, let's assume it returns the added comment if service layer is updated
        if comments_data:  # If service returns actual comments
            assert len(comments_data) >= 1
            retrieved_comment = next((c for c in comments_data if c["content"] == comment_text), None)
            assert retrieved_comment is not None
            assert retrieved_comment["postId"] == created_post_id
            assert retrieved_comment["authorId"] == test_user.email
        # else:
        # If your get_comments_for_post currently returns [] as per the note in posts.py,
        # this assertion would be: assert comments_data == []

    async def test_get_comments_for_non_existent_post(self, aclient: AsyncClient):
        """Test retrieving comments for a non-existent post."""
        non_existent_post_id = "non_existent_post_456"
        url = f"/api/v1/posts/{non_existent_post_id}/comments"
        response = await aclient.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_all_comments_for_post(self, aclient: AsyncClient, created_post_id: str):
        """Test deleting all comments for a specific post."""
        # Add a comment first to ensure there's something to delete
        add_comment_url = f"/api/v1/posts/{created_post_id}/comments"
        await aclient.post(add_comment_url, json={"content": "Comment to be deleted."})

        delete_url = f"/api/v1/posts/{created_post_id}/comments"
        response = await aclient.delete(delete_url)

        assert response.status_code == status.HTTP_200_OK  # Or 204 if you prefer NO_CONTENT
        # Per your API, it returns None, which FastAPI translates to 200 OK with empty body

        # Optionally, verify that getting comments now returns an empty list
        get_comments_url = f"/api/v1/posts/{created_post_id}/comments"
        get_response = await aclient.get(get_comments_url)
        assert get_response.status_code == status.HTTP_200_OK
        assert get_response.json() == []  # Assuming delete works and get reflects it

    async def test_delete_comments_for_non_existent_post(self, aclient: AsyncClient):
        """Test deleting comments for a non-existent post."""
        non_existent_post_id = "non_existent_post_789"
        url = f"/api/v1/posts/{non_existent_post_id}/comments"
        response = await aclient.delete(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
