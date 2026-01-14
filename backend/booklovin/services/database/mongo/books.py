from typing import List, Any
from collections import defaultdict
from booklovin.models.books import ShelfItem
from booklovin.models.errors import UserError
from booklovin.services import errors
from pymongo import UpdateOne

DB_NAME = "booklovin_test"

SHELF_COLLECTION = "shelves"


async def get_user_shelf(db: Any, user_id: str) -> List[ShelfItem]:
    """Retrieves all shelf items for a specific user."""
    shelf_items = []

    cursor = db[SHELF_COLLECTION].find({"authorId": user_id}).sort([("sort_order", 1), ("creationTime", -1)])

    async for item_dict in cursor:
        item_dict.pop("_id", None)
        shelf_items.append(ShelfItem.from_dict(item_dict))  # Use from_dict helper
    return shelf_items


async def get_shelf_by_status(db: Any, user_id: str) -> dict[str, List[ShelfItem]]:
    """Retrieves all shelf items for a user, grouped by status."""
    shelf_items_by_status = defaultdict(list)

    cursor = db[SHELF_COLLECTION].find({"authorId": user_id}).sort([("sort_order", 1), ("creationTime", -1)])

    async for item_dict in cursor:
        item_dict.pop("_id", None)
        item = ShelfItem.from_dict(item_dict)
        shelf_items_by_status[item.status.value].append(item)

    return dict(shelf_items_by_status)


async def add_book_to_shelf(db: Any, user_id: str, item: ShelfItem) -> ShelfItem | UserError:
    """Adds or updates a book on the user's shelf."""
    item.authorId = user_id

    existing_item_dict = await db[SHELF_COLLECTION].find_one({"authorId": user_id, "ol_key": item.ol_key})

    if existing_item_dict:
        update_data = {
            "status": item.status.value,
            "title": item.title,
            "cover_id": item.cover_id,
            "author_names": item.author_names,
            "page_count": item.page_count,
            "progress_percent": item.progress_percent,
            "is_favorite": item.is_favorite,
            "sort_order": item.sort_order,
        }
        await db[SHELF_COLLECTION].update_one({"_id": existing_item_dict["_id"]}, {"$set": update_data})
        updated_doc = await db[SHELF_COLLECTION].find_one({"_id": existing_item_dict["_id"]})
        if updated_doc:
            updated_doc.pop("_id", None)
            return ShelfItem.from_dict(updated_doc)
        else:
            return errors.NOT_FOUND
    else:
        item_dict_to_insert = item.model_dump(exclude={"id"})
        item_dict_to_insert["status"] = item.status.value

        await db[SHELF_COLLECTION].insert_one(item_dict_to_insert)
        return item


async def remove_book_from_shelf(db: Any, user_id: str, ol_key: str) -> None | UserError:
    """Removes a book from the user's shelf."""
    result = await db[SHELF_COLLECTION].delete_one({"authorId": user_id, "ol_key": ol_key})
    if result.deleted_count == 0:
        return errors.NOT_FOUND  # Return standard UserError
    return None  # Return None on success


async def update_book_progress(db: Any, user_id: str, ol_key: str, progress: int) -> ShelfItem | UserError:
    """Updates the progress_percent for a single book on the user's shelf."""

    result = await db[SHELF_COLLECTION].find_one_and_update(
        {"authorId": user_id, "ol_key": ol_key}, {"$set": {"progress_percent": progress}}, return_document=True
    )

    if not result:
        return errors.NOT_FOUND

    result.pop("_id", None)
    return ShelfItem.from_dict(result)


async def update_book_favorite(db: Any, user_id: str, ol_key: str, is_favorite: bool) -> ShelfItem | UserError:
    """Updates the is_favorite status for a single book on the user's shelf."""

    result = await db[SHELF_COLLECTION].find_one_and_update(
        {"authorId": user_id, "ol_key": ol_key}, {"$set": {"is_favorite": is_favorite}}, return_document=True
    )

    if not result:
        return errors.NOT_FOUND

    result.pop("_id", None)
    return ShelfItem.from_dict(result)


async def update_shelf_order(db: Any, user_id: str, ordered_keys: List[str]) -> List[ShelfItem] | UserError:
    """
    Updates the sort_order for all books on a user's shelf based on a provided list.
    """
    if not ordered_keys:
        return []

    operations = []
    for index, ol_key in enumerate(ordered_keys):
        if not ol_key.startswith("/"):
            ol_key = "/" + ol_key

        op = UpdateOne({"authorId": user_id, "ol_key": ol_key}, {"$set": {"sort_order": index}})
        operations.append(op)

    if not operations:
        return errors.BAD_REQUEST

    result = await db[SHELF_COLLECTION].bulk_write(operations, ordered=False)

    if result.matched_count == 0:
        return errors.NOT_FOUND

    return await get_user_shelf(db, user_id)
