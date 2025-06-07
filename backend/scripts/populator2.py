#!/bin/env python
import asyncio
import random

from booklovin.main import booklovin
from booklovin.models.post import Post
from booklovin.models.users import User
from booklovin.services import database
from lorem_text import lorem

NB_LIKES = 30
USER_POSTS_MIN = 2
USER_POSTS_MAX = 10

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


async def real_main():
    backend = database.init("mongo")
    await backend.setup(booklovin)
    db = booklovin.state.db
    for user in users:
        u = User(name=user[2], email=user[0], password=user[1])
        try:
            await database.users.create(db, u)
        except Exception as e:
            print(f"E: {e}")

        # create some posts
        for n in range(random.randint(USER_POSTS_MIN, USER_POSTS_MAX)):
            text = lorem.paragraphs(random.randint(1, 5))
            p = Post(title=lorem.sentence(), content=text, links=[], imageUrl="", authorId=user[0])
            await database.post.create(db, p)

    all_posts = await database.post.get_all(db, 0, 40)
    # create some random likes
    for n in range(NB_LIKES):
        random_user = random.choice(users)
        random_post = random.choice(all_posts)
        print(random_user[0], "like", random_post.uid)
        await database.post.like(db, user_id=random_user[0], post_id=random_post.uid)


def main():
    try:
        asyncio.run(real_main())
    except asyncio.CancelledError:
        pass


main()
