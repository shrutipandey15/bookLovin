from typing import List, Optional, Any
from booklovin.models.books import ShelfItem, ShelfItemCreate
from booklovin.models.errors import UserError
from booklovin.services import errors 
from booklovin.models.users import User

DB_NAME = "booklovin_test" 

SHELF_COLLECTION = "shelves"

async def get_user_shelf(db: Any, user_id: str) -> List[ShelfItem]:
    """Retrieves all shelf items for a specific user."""
    shelf_items = []
    cursor = db[SHELF_COLLECTION].find({"authorId": user_id}).sort("creationTime", -1) # Sort by creation time maybe?
    async for item_dict in cursor:
        item_dict.pop("_id", None)
        shelf_items.append(ShelfItem.from_dict(item_dict)) # Use from_dict helper
    return shelf_items

async def add_book_to_shelf(db: Any, user_id: str, item: ShelfItem) -> ShelfItem | UserError:
    """Adds or updates a book on the user's shelf."""
    item.authorId = user_id

    existing_item_dict = await db[SHELF_COLLECTION].find_one(
        {"authorId": user_id, "ol_key": item.ol_key}
    )

    if existing_item_dict:
        update_data = {
            "status": item.status.value, # Save enum value
            "title": item.title,
            "cover_id": item.cover_id,
            "author_names": item.author_names
        }
        await db[SHELF_COLLECTION].update_one(
            {"_id": existing_item_dict["_id"]},
            {"$set": update_data}
        )
        updated_doc = await db[SHELF_COLLECTION].find_one({"_id": existing_item_dict["_id"]})
        if updated_doc:
             updated_doc.pop("_id", None)
             return ShelfItem.from_dict(updated_doc)
        else:
             return errors.NOT_FOUND # Or a different error indicating update issue
    else:
        item_dict_to_insert = item.model_dump(exclude={"id"})
        await db[SHELF_COLLECTION].insert_one(item_dict_to_insert)
        return item

async def remove_book_from_shelf(db: Any, user_id: str, ol_key: str) -> None | UserError:
    """Removes a book from the user's shelf."""
    result = await db[SHELF_COLLECTION].delete_one(
        {"authorId": user_id, "ol_key": ol_key}
    )
    if result.deleted_count == 0:
        return errors.NOT_FOUND # Return standard UserError
    return None # Return None on success