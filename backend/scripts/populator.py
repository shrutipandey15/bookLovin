#!/bin/env python
import timeit
import asyncio
import random
from contextlib import asynccontextmanager
import httpx
from lorem_text import lorem
from asgi_lifespan import LifespanManager
from booklovin.main import booklovin as app
from httpx import ASGITransport

users = [
    ["test@test.com", "test", "John doe"],
    ["toto@tata.com", "toto", "Mr Toe"],
    ["user1@example.com", "user1", "Alice Smith"],
    ["user2@example.com", "user2", "Bob Johnson"],
    ["user3@example.com", "user3", "Charlie Brown"],
    ["user4@example.com", "user4", "Diana Prince"],
    ["user5@example.com", "user5", "Edward Nigma"],
    ["user6@example.com", "user6", "Fiona Glenanne"],
    ["user7@example.com", "user7", "George Costanza"],
    ["user8@example.com", "user8", "Hannah Montana"],
    ["user9@example.com", "user9", "Ivan Drago"],
    ["user10@example.com", "user10", "Julia Child"],
]


@asynccontextmanager
async def new_client(user, passwd, name):
    """Async (logged-in) client fixture."""
    async with LifespanManager(app) as _:
        async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://booklov.in") as client:
            response = await client.post(
                "/api/v1/auth/register",  # Adjust URL prefix if needed
                json={
                    "username": name,
                    "email": user,
                    "password": passwd,
                },
            )
            login_response = await client.post(
                "/api/v1/auth/login",
                data={"username": user, "password": passwd},
            )
            # print(response.text, login_response.text)
            assert login_response.status_code == 200
            d = login_response.json()
            token = d["access_token"]

            client.headers["Authorization"] = f"Bearer {token}"
            yield client


all_posts = []


async def main():
    for user in users:
        async with new_client(*user) as client:
            # Create a few posts
            for n in range(random.randint(2, 10)):
                text = lorem.paragraphs(random.randint(1, 5))
                post = {
                    "content": text,
                    "title": lorem.sentence(),
                    "links": [],
                    "imageUrl": "",
                }
                # print(n, post)
                req = await client.post(
                    "/api/v1/posts/",
                    json=post,
                )
                all_posts.append(req.json()["uid"])

            # make some random likes
            for n in range(random.randint(1, 10)):
                req = await client.post(
                    f"/api/v1/posts/{random.choice(all_posts)}/like",
                )


def runner():
    d = timeit.timeit(
        "asyncio.run(main())",
        globals=globals(),
        number=1,
    )
    print("Ran in %.2f seconds" % d)


if __name__ == "__main__":
    runner()
