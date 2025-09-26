import pytest
from booklovin.tests.conftest import assert_success, assert_error
from booklovin.core.config import TEST_PASSWORD, TEST_USERNAME

# A new user for our test case
user_b_email = "user_b@example.com"
user_b_pass = "password_b"
user_b_name = "User B"

# Another new user for our test case
user_c_email = "user_c@example.com"
user_c_pass = "password_c"
user_c_name = "User C"


@pytest.fixture(scope="module", autouse=True)
async def register_additional_users(client):
    """Register additional users needed for this test module."""
    for email, password, username in [
        (user_b_email, user_b_pass, user_b_name),
        (user_c_email, user_c_pass, user_c_name),
    ]:
        await client.post(
            "/api/v1/auth/register",
            json={"username": username, "email": email, "password": password},
        )


async def login_and_get_client(client, email, password):
    """Helper function to log in a user and return a client with their token."""
    login_response = await client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    authed_client = client
    authed_client.headers["Authorization"] = f"Bearer {token}"
    return authed_client


@pytest.mark.asyncio
async def test_delete_comment_permissions(client):
    """
    Verify that only the comment author or post author can delete a comment.
    1. User A (the test user from conftest) creates a post.
    2. User B comments on User A's post.
    3. User C (an attacker) tries and fails to delete User B's comment.
    4. User A (post author) successfully deletes User B's comment.
    5. Re-create the comment.
    6. User B (comment author) successfully deletes their own comment.
    """
    # 1. User A (post author) creates a post
    user_a_client = await login_and_get_client(client, TEST_USERNAME, TEST_PASSWORD)
    post_payload = {
        "title": "Post by User A",
        "content": "A post for testing comment permissions.",
    }
    post_response = await user_a_client.post("/api/v1/posts/", json=post_payload)
    assert_success(post_response)
    post_id = post_response.json()["uid"]

    # 2. User B comments on User A's post
    user_b_client = await login_and_get_client(client, user_b_email, user_b_pass)
    comment_payload = {"postId": post_id, "content": "A comment from User B"}
    comment_response = await user_b_client.post(f"/api/v1/posts/{post_id}/comments", json=comment_payload)
    assert_success(comment_response)
    comment_id = comment_response.json()["uid"]

    # 3. User C (attacker) TRIES AND FAILS to delete User B's comment
    user_c_client = await login_and_get_client(client, user_c_email, user_c_pass)
    delete_attempt_by_c = await user_c_client.delete(f"/api/v1/posts/{post_id}/comments/{comment_id}")
    assert_error(delete_attempt_by_c)
    assert delete_attempt_by_c.json()["error"] == "PERMISSION_DENIED"

    # 4. User A (post author) SUCCEEDS in deleting User B's comment
    delete_attempt_by_a = await user_a_client.delete(f"/api/v1/posts/{post_id}/comments/{comment_id}")
    assert_success(delete_attempt_by_a)

    # Verify the comment is gone
    comments_after_delete_by_a = await user_a_client.get(f"/api/v1/posts/{post_id}/comments")
    assert_success(comments_after_delete_by_a)
    assert len(comments_after_delete_by_a.json()) == 0

    # 5. Re-create the comment for the next part of the test
    comment_response_2 = await user_b_client.post(f"/api/v1/posts/{post_id}/comments", json=comment_payload)
    assert_success(comment_response_2)
    comment_id_2 = comment_response_2.json()["uid"]

    # 6. User B (comment author) SUCCEEDS in deleting their own comment
    delete_attempt_by_b = await user_b_client.delete(f"/api/v1/posts/{post_id}/comments/{comment_id_2}")
    assert_success(delete_attempt_by_b)

    # Verify the comment is gone again
    comments_after_delete_by_b = await user_a_client.get(f"/api/v1/posts/{post_id}/comments")
    assert_success(comments_after_delete_by_b)
    assert len(comments_after_delete_by_b.json()) == 0
