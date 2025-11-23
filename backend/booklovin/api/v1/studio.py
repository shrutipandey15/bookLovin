from fastapi import APIRouter, Depends, HTTPException, status, Request
import time
import os
import uuid
import aiofiles
import io
from typing import List

from booklovin.utils.user_token import get_from_token
from booklovin.models.users import User
from booklovin.models.studio import ImagePrompt, CreationData, CreationSaveRequest
from booklovin.core import config
# 1. Import the ASYNC client instead
from huggingface_hub import AsyncInferenceClient
from PIL import Image

router = APIRouter()

CREATIONS_DIR = "static/images/creations"
os.makedirs(CREATIONS_DIR, exist_ok=True)

# 2. Make the function itself async (it already is)
@router.post("/generate-image")
async def generate_free_image(prompt: ImagePrompt):
    """
    FREE IMPLEMENTATION: Calls Hugging Face's free Inference API.
    Saves the image locally and returns the static URL.
    """
    if not config.HUGGINGFACE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image generation service is not configured.",
        )
    
    print(f"Received free image generation prompt: {prompt.prompt}")

    try:
        # 3. Use the AsyncInferenceClient
        client = AsyncInferenceClient(token=config.HUGGINGFACE_API_KEY)
        
        # 4. AWAIT the text_to_image call
        image = await client.text_to_image(
            prompt.prompt,
            model="stabilityai/stable-diffusion-xl-base-1.0"
        )
        
        # ... (the rest of the function is correct) ...
        file_name = f"{uuid.uuid4()}.png"
        file_path = os.path.join(CREATIONS_DIR, file_name)
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(buffer.read())
        
        image_url = f"/{file_path}"
        print(f"Image saved to: {image_url}")
        return {"imageUrl": image_url}
    
    except Exception as e:
        # This will now catch the real error
        print(f"Error generating image: {e}") 
        if "is currently loading" in str(e):
             raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The AI model is waking up. Please try again in 20 seconds.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred with the image generation service: {e}",
        )


# ... (save_creation and get_my_creations functions are fine) ...

@router.post("/save-creation")
async def save_creation(
    request_data: CreationSaveRequest, 
    request: Request, 
    current_user: User = Depends(get_from_token) 
):
    """
    Saves the generated creation to the database.
    """
    db = request.app.state.db 
    user_id = current_user.uid 
    
    print(f"Saving creation for user {user_id} and book {request_data.bookId}")
    
    creation_doc = CreationData(
        authorId=user_id, 
        book_id=request_data.bookId,
        prompt=request_data.prompt,
        image_url=request_data.imageUrl 
    )
    
    try:
        await db.studio.save_new_creation(creation_doc)
        return {
            "status": "success", 
            "message": "Creation saved",
            "uid": creation_doc.uid
        }
    except Exception as e:
        print(f"Error saving creation to DB: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save creation to the database."
        )


@router.get("/my-creations", response_model=List[CreationData])
async def get_my_creations(
    request: Request, 
    current_user: User = Depends(get_from_token) 
):
    """
    Gets all AI creations for the currently authenticated user.
    """
    db = request.app.state.db 
    user_id = current_user.uid 
    
    creations = await db.studio.get_creations_by_user(user_id) 
    return creations


routers = [router]