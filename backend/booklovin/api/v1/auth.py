from datetime import datetime, timedelta, timezone
from typing import Annotated

from booklovin.auth_utils import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY, get_from_token
from booklovin.core.config import pwd_context
from booklovin.errors import ErrorCode
from booklovin.models.users import User
from booklovin.services.users_service import create_user, get_user
from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt

router = APIRouter(tags=["auth"])


@router.get("/me")
async def me_page(user: User = Depends(get_from_token)) -> User:
    return user


@router.post("/register")
async def register(username: Annotated[str, Form()], email: Annotated[str, Form()], password: Annotated[str, Form()]):
    existing_user = await get_user(email=email)
    if existing_user:
        return {"error": ErrorCode.USER_ALREADY_EXISTS}
    user_id = await create_user(name=username, email=email, password=password)
    return {"id": user_id}


@router.post("/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_user(email=form_data.username)

    # Use a generic error message to avoid revealing whether username exists
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not user:
        raise credentials_exception

    # Adapt access based on whether 'user' is a dict or an object
    hashed_password = user["password"]

    if not hashed_password or not pwd_context.verify(form_data.password, hashed_password):
        raise credentials_exception

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # The 'sub' (subject) claim is typically the user identifier (e.g., username or user ID)
    access_token = create_access_token(data={"sub": form_data.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Default expiration time if none provided
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
