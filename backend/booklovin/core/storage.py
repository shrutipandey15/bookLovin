import aiofiles
import logging
import uuid
import os
from typing import List
from fastapi import UploadFile, HTTPException, status

logger = logging.getLogger(__name__)

UPLOAD_DIR = "static/images/posts"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


async def save_uploaded_images(files: List[UploadFile]) -> List[str]:
    """
    Saves a list of uploaded files to the UPLOAD_DIR
    and returns a list of their web-accessible URLs.
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    image_urls = []
    for file in files:
        # Validate content type
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            continue

        # Validate extension
        if not file.filename or "." not in file.filename:
            continue
        ext = file.filename.rsplit(".", 1)[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue

        # Read file content and check size
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB",
            )

        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        try:
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(content)
        except IOError as e:
            logger.error(f"Error saving file: {e}")
            continue

        image_urls.append(f"/static/images/posts/{filename}")

    return image_urls
