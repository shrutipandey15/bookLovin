"""User authentication and registration endpoints."""

from datetime import datetime, timedelta, timezone
from typing import cast

from booklovin.core.config import APIResponse, pwd_context
from booklovin.core.settings import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY
from booklovin.models.errors import ErrorCode, UserError, gen_error
from booklovin.models.users import NewUser, User
from booklovin.services import database
from booklovin.utils.user_token import get_from_token
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt

router = APIRouter(tags=["auth"])
debug_router = APIRouter(tags=["test"])

ALREADY_EXISTS = gen_error(ErrorCode.ALREADY_EXISTS, details="User already exists")
CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Incorrect username or password",
    headers={"WWW-Authenticate": "Bearer"},
)


@debug_router.get("/null", response_class=APIResponse)
async def null_page() -> None:
    return None


@debug_router.get("/me", response_class=APIResponse)
async def me_page(user: User = Depends(get_from_token)) -> User:
    return user


@router.post("/register", response_class=APIResponse)
async def register(request: Request, user: NewUser, response_model=None | UserError) -> None | UserError:
    existing_user = await database.users.get(db=request.app.state.db, email=user.email)
    if existing_user:
        return ALREADY_EXISTS
    passwd = pwd_context.hash(user.password)
    new_user = User(name=user.username, email=user.email, password=passwd)
    await database.users.create(db=request.app.state.db, user=new_user)
    return None


@router.post("/login", response_model=dict | UserError, response_class=APIResponse)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    user = await database.users.get(db=request.app.state.db, email=form_data.username)

    if not user:
        raise CREDENTIALS_EXCEPTION

    verification_passed = pwd_context.verify(form_data.password, user.password)

    if not verification_passed:
        raise CREDENTIALS_EXCEPTION

    return {
        "access_token": _create_access_token(form_data.username),
        "token_type": "bearer",
    }


def _create_access_token(user_id: str, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)) -> str:
    ref = datetime.now(timezone.utc)
    data = {
        "sub": user_id,
        "exp": ref + expires_delta,
        "iat": ref,
    }
    return cast(str, jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM))


routers = (router, debug_router)
