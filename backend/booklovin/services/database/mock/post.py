"""Database helpers for mocked db: Posts"""

from booklovin.core.settings import RECENT_POSTS_LIMIT
from booklovin.models.errors import UserError
from booklovin.models.post import Post
from booklovin.models.comments import Comment
from booklovin.models.users import User
from booklovin.services import errors

from .core import State


async def create(db: State, post: Post) -> None | UserError:
    """create a post"""
    db.posts.append(post)
    db.posts_count += 1
    db.save()
    return None


async def get_all(db: State, start: int, end: int) -> list[Post]:
    """get all posts"""
    return db.posts[start:end]


async def like(db: State, post_id: str, user_id: str) -> None | UserError:
    """like a post"""
    post = await get_one(db, post_id)
    if not post:
        return errors.POST_NOT_FOUND
    db.likes[post_id].add(user_id)
    db.save()
    return None


async def get_recent(db: State, user: User) -> list[Post] | UserError:
    """Returns a list of recent subscribed posts"""
    return db.posts[:RECENT_POSTS_LIMIT]  # Mocked recent posts


async def get_popular(db: State) -> list[Post] | UserError:
    """Returns the most popular posts."""
    sorted_likes = sorted(db.likes.items(), key=lambda x: len(x[1]), reverse=True)
    top_likes = sorted_likes[:RECENT_POSTS_LIMIT]
    results = [await get_one(db, post_id) for post_id, _ in top_likes]
    assert None not in results
    return results  # type: ignore


async def exists(db: State, post_id: str) -> bool:
    for post in db.posts:
        if post.uid == post_id:
            return True
    return False


async def get_one(db: State, post_id: str) -> Post | None:
    """get one post"""
    for post in db.posts:
        if post.uid == post_id:
            if post_id in db.likes:
                post.likes = len(db.likes[post_id])
            return post
    return None


async def update(db: State, post_id: str, post_data: Post) -> None | UserError:
    """Updates an existing post."""
    update_data = post_data.model_dump(exclude_unset=True)
    post = await get_one(db, post_id)
    if post:
        post.update(update_data)
        db.save()
    else:
        return errors.POST_NOT_FOUND
    return None


async def delete(db: State, post_id: str) -> None | UserError:
    """Deletes a post by its ID."""
    if post_id in db.likes:
        del db.likes[post_id]
    post = await get_one(db, post_id)
    if not post:
        return errors.POST_NOT_FOUND
    try:
        db.posts.remove(post)
    except ValueError:
        return errors.POST_NOT_FOUND
    db.posts_count -= 1
    db.save()
    return None


async def add_comment(db: State, comment: Comment) -> None | UserError:
    """Add a comment to a post.

    Args:
        db: Database state
        post_id: ID of the post to comment on
        user_id: ID of the user making the comment
        comment: The comment data

    Returns:
        None on success, UserError on failure
    """
    db.comments[comment.postId].append(comment)
    db.save()
    return None


async def get_comments(db: State, post_id: str) -> None | UserError | list[Comment]:
    """Get all comments for a post.

    Args:
        db: Database state
        post_id: ID of the post to get comments for

    Returns:
        List of comments on success, UserError on failure
    """
    post = await get_one(db, post_id)
    if not post:
        return errors.POST_NOT_FOUND

    return db.comments.get(post_id, [])


async def delete_comment(db: State, post_id: str, comment_id: str) -> None | UserError:
    """Delete all comments for a post.

    Args:
        db: Database state
        post_id: ID of the post to delete comments for

    Returns:
        None on success, UserError on failure
    """
    if post_id in db.comments:
        if comment_id:
            # Remove a specific comment
            db.comments[post_id] = [c for c in db.comments[post_id] if c.uid != comment_id]
        db.save()

    return None
