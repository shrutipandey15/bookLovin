from typing import Any, List
from booklovin.models.users import User
from booklovin.models.post import Post
from booklovin.models.profile import UserProfile, UserPublic, UserStats, ReadingPersonality
from booklovin.models.errors import UserError
from booklovin.services import errors
from booklovin.models.books import ShelfStatus

DB_NAME = "booklovin_test"

async def get_profile_by_name(db: Any, name: str) -> UserProfile | UserError:
    """
    Fetches a user's public info and all their posts by NAME.
    """
    user_doc = await db["users"].find_one({"name": name})
    if not user_doc:
        return errors.NOT_FOUND

    user_id = user_doc["uid"]

    books_read_count = await db["shelves"].count_documents({
        "authorId": user_id,
        "status": ShelfStatus.READ.value
    })
    journal_entries_count = await db["journals"].count_documents({"authorId": user_id})
    posts_count = await db["posts"].count_documents({"authorId": user_id})

    user_stats = UserStats(
        books_read_count=books_read_count,
        journal_entries_count=journal_entries_count,
        posts_count=posts_count,
        # followers_count=followers_count
    )
    reading_personality = ReadingPersonality(
        favorite_genres=user_doc.get("favorite_genres") or [],
        reading_goal_year=user_doc.get("reading_goal_year"),
        reading_goal_count=user_doc.get("reading_goal_count"),
        literary_archetype=user_doc.get("literary_archetype")
    )

    user_public = UserPublic(
        uid=user_id,
        username=user_doc["name"],
        email=user_doc["email"],
        bio=user_doc.get("bio"),
        favorite_quote=user_doc.get("favorite_quote"),
        stats=user_stats,
        reading_personality=reading_personality
    )

    posts = []
    cursor = db["posts"].find({"authorId": user_id}).sort("creationTime", -1)
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
    
async def update_user_genres(db: Any, user_id: str, genres: List[str]) -> User | UserError:
    """Updates the favorite_genres for a specific user."""
    result = await db["users"].update_one(
        {"uid": user_id},
        {"$set": {"favorite_genres": genres}} # Save the list
    )
    if result.matched_count == 0: return errors.NOT_FOUND
    updated_user_doc = await db["users"].find_one({"uid": user_id})
    if updated_user_doc:
         updated_user_doc.pop("_id", None)
         return User.model_validate(updated_user_doc)
    return errors.NOT_FOUND

async def update_user_goal(db: Any, user_id: str, year: int, count: int) -> User | UserError:
    """Updates the reading goal for a specific user."""
    result = await db["users"].update_one(
        {"uid": user_id},
        {"$set": {"reading_goal_year": year, "reading_goal_count": count}}
    )
    if result.matched_count == 0: return errors.NOT_FOUND
    updated_user_doc = await db["users"].find_one({"uid": user_id})
    if updated_user_doc:
         updated_user_doc.pop("_id", None)
         return User.model_validate(updated_user_doc)
    return errors.NOT_FOUND