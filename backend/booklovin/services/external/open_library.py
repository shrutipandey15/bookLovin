import httpx
from typing import Optional, List, Dict, Any

OPEN_LIBRARY_API_URL = "https://openlibrary.org"
ARCHIVE_ORG_API_URL = "https://archive.org"

async def search_books(query: str, limit: int = 10) -> Dict[str, Any]:
    """
    Searches the Open Library API for books.
    """
    search_url = f"{OPEN_LIBRARY_API_URL}/search.json"
    params = {"q": query, "limit": limit, "fields": "key,title,author_name,cover_i,isbn,id_project_gutenberg,id_internet_archive"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(search_url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"HTTP error occurred: {e}")
            return {"docs": []}
        except httpx.RequestError as e:
            print(f"An error occurred while requesting {e.request.url!r}: {e}")
            return {"docs": []}

async def get_book_details(ol_key: str) -> Dict[str, Any]:
    """
    Fetches detailed information for a single book from Open Library.
    """
    book_url = f"{OPEN_LIBRARY_API_URL}{ol_key}.json"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(book_url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"HTTP error occurred: {e}")
            return {}