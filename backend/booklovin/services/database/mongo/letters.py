from datetime import datetime, timezone
from booklovin.models.letters import Letter, LetterStatus
from booklovin.services import errors
from pymongo.asynchronous.database import AsyncDatabase as Database

async def create(db: Database, letter: Letter) -> Letter:
    """Creates a new letter document in the database."""
    await db.letters.insert_one(letter.model_dump())
    return letter

async def get_all_for_user(db: Database, user_id: str) -> list[Letter]:
    """Retrieves all letters for a specific user from the database."""
    cursor = db.letters.find({"authorId": user_id}).sort("target_date", -1)
    letters_doc = await cursor.to_list(length=200)
    return [Letter.from_dict(letter) for letter in letters_doc]

async def mark_as_opened(db: Database, letter_id: str, user_id: str) -> Letter | None:
    """Updates a letter's status to 'opened' in the database."""
    update_result = await db.letters.update_one(
        {"uid": letter_id, "authorId": user_id},
        {"$set": {"status": LetterStatus.OPENED, "opened_at": datetime.now(timezone.utc)}}
    )
    if update_result.matched_count == 0:
        return None
    
    updated_doc = await db.letters.find_one({"uid": letter_id})
    return Letter.from_dict(updated_doc) if updated_doc else None

async def delete(db: Database, letter_id: str, user_id: str) -> bool:
    """Deletes a letter from the database by its ID."""
    delete_result = await db.letters.delete_one({"uid": letter_id, "authorId": user_id})
    return delete_result.deleted_count > 0