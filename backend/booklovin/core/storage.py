import aiofiles
import uuid
import os
from typing import List
from fastapi import UploadFile

UPLOAD_DIR = "static/images/posts"

async def save_uploaded_images(files: List[UploadFile]) -> List[str]:
    """
    Saves a list of uploaded files to the UPLOAD_DIR
    and returns a list of their web-accessible URLs.
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    image_urls = []
    for file in files:
        if not file.content_type.startswith("image/"):
            continue
            
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        try:
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(await file.read())
        except Exception as e:
            print(f"Error saving file: {e}")
            continue
            
        image_urls.append(f"/static/images/posts/{filename}")
        
    return image_urls