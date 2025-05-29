"""Utility functions to handle user tokens."""

from functools import lru_cache
from typing import cast

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt

from booklovin.core.config import oauth2_scheme
from booklovin.core.settings import ALGORITHM, SECRET_KEY
from booklovin.models.users import User
from booklovin.services.database import users

CredentialsException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


@lru_cache
def decode_token(token: str) -> str | None:
    """Decode a JWT token to extract the user ID."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return cast(str, payload.get("sub"))


# Dependency to get the current user from the token
async def get_from_token(request: Request, token: str = Depends(oauth2_scheme)) -> User | None:
    """Dependency function to get the currently logged user."""
    try:
        user_id = decode_token(token)
        if user_id is None:
            raise CredentialsException
    except JWTError as exc:
        raise CredentialsException from exc
    else:
        user = await users.get(db=request.app.state.db, email=user_id)
        if user is None:
            raise CredentialsException
        return user
