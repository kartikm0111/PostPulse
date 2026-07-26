import logging
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.config import settings

logger = logging.getLogger("postpulse.database")

# Memory / JSON fallback store for offline / zero-config dev
class InStoreCollection:
    def __init__(self, name: str):
        self.name = name
        self._data: Dict[str, Dict[str, Any]] = {}

    async def insert_one(self, doc: Dict[str, Any]):
        doc_id = doc.get("id") or doc.get("_id") or str(len(self._data) + 1)
        doc["_id"] = doc_id
        doc["id"] = doc_id
        self._data[doc_id] = doc
        class InsertResult:
            inserted_id = doc_id
        return InsertResult()

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for item in self._data.values():
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                return item.copy()
        return None

    async def find(self, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        query = query or {}
        results = []
        for item in self._data.values():
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                results.append(item.copy())
        return results

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        item = await self.find_one(query)
        if item:
            item_id = item["_id"]
            if "$set" in update:
                self._data[item_id].update(update["$set"])
            class UpdateResult:
                modified_count = 1
            return UpdateResult()
        class UpdateResult:
            modified_count = 0
        return UpdateResult()

    async def delete_one(self, query: Dict[str, Any]):
        item = await self.find_one(query)
        if item:
            del self._data[item["_id"]]
            class DeleteResult:
                deleted_count = 1
            return DeleteResult()
        class DeleteResult:
            deleted_count = 0
        return DeleteResult()

class DatabaseManager:
    def __init__(self):
        self.use_mongo = False
        self.db = None
        self.collections: Dict[str, Any] = {}

    async def connect(self):
        try:
            from motor.motor_asyncio import AsyncIOMotorClient  # type: ignore
            client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            # Ping database to test connection
            await client.admin.command('ping')
            self.db = client[settings.DATABASE_NAME]
            self.use_mongo = True
            logger.info(f"Connected successfully to MongoDB at {settings.MONGODB_URL}")
        except Exception as e:
            logger.warning(f"MongoDB connection unavailable ({e}). Using In-Memory Fast Store with zero setup required!")
            self.use_mongo = False
            self.collections = {
                "users": InStoreCollection("users"),
                "accounts": InStoreCollection("accounts"),
                "posts": InStoreCollection("posts"),
                "analytics": InStoreCollection("analytics")
            }

    def get_collection(self, name: str):
        if self.use_mongo:
            return self.db[name]
        if name not in self.collections:
            self.collections[name] = InStoreCollection(name)
        return self.collections[name]

db_manager = DatabaseManager()
