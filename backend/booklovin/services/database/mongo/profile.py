from typing import Any
from booklovin.models.users import User
from booklovin.models.post import Post
from booklovin.models.profile import UserProfile, UserPublic
from booklovin.models.errors import UserError
from booklovin.services import errors

async def get_profile_by_name(db: Any, name: str) -> UserProfile | UserError:
    """
    Fetches a user's public info and all their posts by NAME.
    """
    user_doc = await db["users"].find_one({"name": name})
    if not user_doc:
        return errors.NOT_FOUND

    user_public = UserPublic(
        uid=user_doc["uid"],
        username=user_doc["name"],
        email=user_doc["email"],
        bio=user_doc.get("bio"),
        favorite_quote=user_doc.get("favorite_quote")
    )

    posts = []
    cursor = db["posts"].find({"authorId": user_doc["uid"]}).sort("creationTime", -1)
    async for post_doc in cursor:
        post_doc.pop("_id", None)
        posts.append(Post.from_dict(post_doc))
    
    return UserProfile(user=user_public, posts=posts)

async def update_user_quote(db: Any, user_id: str, quote: str) -> User | UserError:
    """Updates the favorite_quote for a specific user."""
    result = await db["users"].update_one(
        {"uid": user_id},
        {"$set": {"favorite_quote": quote}}
    )

    if result.matched_count == 0:
        return errors.NOT_FOUND

    updated_user_doc = await db["users"].find_one({"uid": user_id})
    if updated_user_doc:
         updated_user_doc.pop("_id", None)
         return User.model_validate(updated_user_doc)
    else:
        return errors.NOT_FOUND