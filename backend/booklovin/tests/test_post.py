from fastapi.testclient import TestClient
from booklovin.main import app

client = TestClient(app)


def test_create_post():
    payload = {
        "title": "Test Book Post",
        "content": "This is a test post about a book.",
        "image_url": "test.jpg",
    }

    response = client.post("/api/v1/posts/", json=payload)

    assert response.status_code == 201
    assert response.json()["title"] == "Test Book Post"
    assert "id" in response.json()


def test_get_post():
    client = TestClient(app)

    payload = {
        "title": "Test Book Post",
        "Content": "Sample content for GET test",
        "image_url": "sample.jpg",
    }
    client.post("/api/v1/posts/", json=payload)

    response = client.get("/api/v1/posts/")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["title"] == "Test Book Post"

