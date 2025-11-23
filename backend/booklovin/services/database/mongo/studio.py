from motor.motor_asyncio import AsyncIOMotorClient
from booklovin.models.studio import CreationData
# 1. REMOVED PyObjectId import
from typing import List

class StudioMongoService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        # 2. Set the collection as an attribute
        self.collection = db.creations

    async def save_new_creation(self, creation_doc: CreationData) -> None:
        """
        Inserts a new creation document into the 'creations' collection.
        Follows the pattern from post.py and journal.py
        """
        # 3. model_dump() is correct, no alias needed for _id
        doc = creation_doc.model_dump() 
        await self.collection.insert_one(doc)
        print(f"Creation saved to MongoDB with UID: {creation_doc.uid}")
        # 4. Return None, matching your other services
        return
    
    async def get_creations_by_user(self, author_id: str) -> List[CreationData]:
        """
        Finds all creations for a given user, sorted newest first.
        """
        creations = []
        # 5. Query by 'authorId' and sort by 'creationTime'
        #    This matches your UserObject model
        cursor = self.collection.find(
            {"authorId": author_id}
        ).sort("creationTime", -1) 
        
        async for doc in cursor:
            creations.append(CreationData(**doc))
            
        return creations