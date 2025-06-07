"""Routes for /posts"""

from booklovin.core.config import APIResponse
from booklovin.models.comments import Comment, NewComment
from booklovin.models.errors import UserError
from booklovin.models.post import NewPost, Post
from booklovin.models.users import User
from booklovin.services import database, errors
from booklovin.utils.user_token import get_from_token
from fastapi import APIRouter, Depends, Request

router = APIRouter(tags=["posts"])


# create
@router.post("/", response_model=Post | UserError, response_class=APIResponse)
async def create_post(request: Request, post: NewPost, user: User = Depends(get_from_token)) -> Post:
    """Create one post"""
    model = post.model_dump()
    new_post = Post(authorId=user.email, **model)

    await database.post.create(db=request.app.state.db, post=new_post)
    return new_post


# list all, deprecated
@router.get("/", response_model=list[Post] | UserError, response_class=APIResponse)
async def read_all_posts(request: Request, s: int, e: int, user: User = Depends(get_from_token)) -> list[Post] | UserError:
    """Get a range of posts (from most recent to oldest)"""
    assert e > s
    if e - s > 40:
        return errors.ABUSIVE_USAGE
    return await database.post.get_all(db=request.app.state.db, start=s, end=e)


@router.get("/recent", response_model=list[Post] | UserError, response_class=APIResponse)
async def read_recent_posts(request: Request, user: User = Depends(get_from_token)) -> list[Post] | UserError:
    """Returns a list of recent subscribed posts"""
    return await database.post.get_recent(db=request.app.state.db, user=user)


@router.get("/popular", response_model=list[Post] | UserError, response_class=APIResponse)
async def read_popular_posts(request: Request, user: User = Depends(get_from_token)) -> list[Post] | UserError:
    """Returns a list of recent popular posts"""
    return await database.post.get_popular(db=request.app.state.db)


# get one
@router.get("/{post_id}", response_model=Post | UserError, response_class=APIResponse)
async def read_one_post(request: Request, post_id: str, user: User = Depends(get_from_token)) -> Post | UserError:
    "Get one specific post"
    post = await database.post.get_one(db=request.app.state.db, post_id=post_id)
    return post or errors.NOT_FOUND


# update
@router.put("/{post_id}", response_model=None | UserError, response_class=APIResponse)
async def update_post(request: Request, post_id: str, post: Post, user: User = Depends(get_from_token)) -> None:
    "Update a specific post"
    await database.post.update(db=request.app.state.db, post_id=post_id, post_data=post)


@router.put("/{post_id}/like", response_model=None | UserError, response_class=APIResponse)
async def like_post(request: Request, post_id: str, user: User = Depends(get_from_token)) -> None:
    "Like a specific post"
    await database.post.like(db=request.app.state.db, post_id=post_id, user_id=user.email)
    return None


# delete
@router.delete("/{post_id}", response_model=None | UserError, response_class=APIResponse)
async def delete_post(request: Request, post_id: str, user: User = Depends(get_from_token)) -> None | UserError:
    "delete a specific post"

    return await database.post.delete(
        db=request.app.state.db,
        post_id=post_id,
    )


@router.post("/{post_id}/comments", response_model=None | UserError, summary="Add a comment to a post", response_class=APIResponse)
async def add_comment_to_post(
    request: Request,
    comment: NewComment,
    user: User = Depends(get_from_token),
) -> None | UserError:
    """
    Add a comment to a specific post.
    """
    # Ensure post exists before adding a comment
    post = await database.post.get_one(db=request.app.state.db, post_id=comment.postId)
    if not post:
        return errors.NOT_FOUND

    model = comment.model_dump()
    new_comment = Comment(authorId=user.email, **model)

    return await database.post.add_comment(db=request.app.state.db, comment=new_comment)


@router.get(
    "/{post_id}/comments", response_model=list[Comment] | UserError, summary="Get all comments for a post", response_class=APIResponse
)
async def get_comments_for_post(request: Request, post_id: str, user: User = Depends(get_from_token)) -> list[Comment] | UserError:
    """
    Retrieve all comments for a specific post.

    Note: The current service interface `PostService.get_comment` returns `None | UserError`.
    For this API to return actual comments, that service method needs to be updated
    to return `list[CommentModelFromService] | UserError`.
    Currently, if the service call succeeds (returns None without error), this returns [].
    """
    # TODO:
    # Ensure post exists
    return await database.post.get_comments(db=request.app.state.db, post_id=post_id)


@router.delete(
    "/{post_id}/comments/{comment_id}",
    response_model=None | UserError,
    summary="Delete all comments for a post",
    response_class=APIResponse,
)
async def delete_a_comments_for_post(
    request: Request, post_id: str, comment_id: str, user: User = Depends(get_from_token)
) -> None | UserError:
    """
    Delete one comment.
    """
    post_to_modify = await database.post.get_one(db=request.app.state.db, post_id=post_id)
    if not post_to_modify:
        return errors.NOT_FOUND

    if post_to_modify.authorId != user.email:
        return errors.FORBIDDEN

    result = await database.post.delete_comment(db=request.app.state.db, post_id=post_id, comment_id=comment_id)
    if isinstance(result, UserError):
        return result
    return None
