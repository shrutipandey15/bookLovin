"""Routes for /posts."""

from booklovin.core.config import APIResponse
from booklovin.models.comments import Comment, NewComment
from booklovin.models.errors import UserError
from booklovin.models.post import NewPost, Post
from booklovin.models.users import User
from booklovin.services import database, errors
from booklovin.utils.user_token import get_from_token
from fastapi import APIRouter, Depends, Request, HTTPException
from booklovin.models.reactions import ReactionRequest

router = APIRouter(tags=["posts"])

crouter = APIRouter(tags=["comments"])


# create
@router.post("/", response_model=Post | UserError, response_class=APIResponse)
async def create_post(request: Request, post: NewPost, user: User = Depends(get_from_token)) -> Post:
    """Create one post."""
    new_post = Post.from_new_model(post, user.uid)
    await database.post.create(db=request.app.state.db, post=new_post)
    return new_post


# list all, deprecated
@router.get("/", response_model=list[Post] | UserError, response_class=APIResponse)
async def read_all_posts(request: Request, s: int, e: int, user: User = Depends(get_from_token)) -> list[Post] | UserError:
    """Get a range of posts (from most recent to oldest)."""
    assert e > s
    if e - s > 40:
        return errors.ABUSIVE_USAGE
    return await database.post.get_all(db=request.app.state.db, start=s, end=e)


@router.get("/recent", response_model=list[Post] | UserError, response_class=APIResponse)
async def read_recent_posts(request: Request, user: User = Depends(get_from_token)) -> list[Post] | UserError:
    """Return a list of recent subscribed posts."""
    return await database.post.get_recent(db=request.app.state.db, user=user)


@router.get("/popular", response_model=list[Post] | UserError, response_class=APIResponse)
async def read_popular_posts(request: Request, user: User = Depends(get_from_token)) -> list[Post] | UserError:
    """Return a list of recent popular posts."""
    return await database.post.get_popular(db=request.app.state.db)


# get one
@router.get("/{post_id}", response_model=Post | UserError, response_class=APIResponse)
async def read_one_post(request: Request, post_id: str, user: User = Depends(get_from_token)) -> Post | UserError:
    """Get one specific post."""
    post = await database.post.get_one(db=request.app.state.db, post_id=post_id)
    return post or errors.POST_NOT_FOUND


# update
@router.put("/{post_id}", response_model=None | UserError, response_class=APIResponse)
async def update_post(request: Request, post_id: str, post: Post, user: User = Depends(get_from_token)) -> None:
    """Update a specific post."""
    await database.post.update(db=request.app.state.db, post_id=post_id, post_data=post)


@router.put("/{post_id}/react", response_model=dict, response_class=APIResponse)
async def react_to_post(request: Request, post_id: str, payload: ReactionRequest, user: User = Depends(get_from_token)):
    """React to a specific post."""
    db = request.app.state.db
    await database.post.react(db=db, post_id=post_id, user_id=user.uid, reaction_type=payload.reaction)

    updated_post = await database.post.get_one(db=db, post_id=post_id)
    if not updated_post:
        raise HTTPException(status_code=404, detail="Post not found after reaction.")

    return updated_post.reactions


@router.delete("/{post_id}", response_model=None | UserError, response_class=APIResponse)
async def delete_post(request: Request, post_id: str, user: User = Depends(get_from_token)) -> None | UserError:
    """Delete a specific post."""
    return await database.post.delete(
        db=request.app.state.db,
        post_id=post_id,
    )


@crouter.post("/{post_id}/comments", response_model=Comment, summary="Add a comment to a post", response_class=APIResponse)
async def add_comment_to_post(
    request: Request,
    comment: NewComment,
    user: User = Depends(get_from_token),
) -> Comment:
    """Add a comment to a specific post."""
    db = request.app.state.db
    if not await database.post.exists(db=db, post_id=comment.postId):
        return errors.POST_NOT_FOUND

    new_comment = Comment.from_new_model(comment, user.uid)

    await database.post.add_comment(db=db, comment=new_comment)

    author_details = {"penName": user.name}
    comment_response_dict = new_comment.model_dump()
    comment_response_dict["author"] = author_details

    return Comment.from_dict(comment_response_dict)


@crouter.get(
    "/{post_id}/comments", response_model=list[Comment] | UserError, summary="Get all comments for a post", response_class=APIResponse
)
async def get_comments_for_post(request: Request, post_id: str, user: User = Depends(get_from_token)) -> list[Comment] | UserError:
    """Retrieve all comments for a specific post."""
    if not await database.post.exists(db=request.app.state.db, post_id=post_id):
        return errors.POST_NOT_FOUND
    return await database.post.get_comments(db=request.app.state.db, post_id=post_id) or []


@crouter.delete(
    "/{post_id}/comments/{comment_id}",
    response_model=None | UserError,
    summary="Delete a comment from a post",
    response_class=APIResponse,
)
async def delete_a_comments_for_post(
    request: Request, post_id: str, comment_id: str, user: User = Depends(get_from_token)
) -> None | UserError:
    """Delete one comment."""
    post_to_modify = await database.post.get_one(db=request.app.state.db, post_id=post_id)
    if not post_to_modify:
        return errors.POST_NOT_FOUND

    comments_result = await database.post.get_comments(db=request.app.state.db, post_id=post_id)
    if isinstance(comments_result, UserError) or not comments_result:
        return errors.NOT_FOUND

    comment_to_delete = next((c for c in comments_result if c.uid == comment_id), None)

    if not comment_to_delete:
        return errors.NOT_FOUND

    if comment_to_delete.authorId != user.uid and post_to_modify.authorId != user.uid:
        return errors.FORBIDDEN

    result = await database.post.delete_comment(db=request.app.state.db, post_id=post_id, comment_id=comment_id)
    if isinstance(result, UserError):
        return result
    return None


routers = [router, crouter]
