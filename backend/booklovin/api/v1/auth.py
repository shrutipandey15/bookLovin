from datetime import datetime, timedelta, timezone

from booklovin.core.utils import isError
from booklovin.core.config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY, pwd_context
from booklovin.models.errors import ErrorCode, UserError, gen_error
from booklovin.models.users import NewUser, User
from booklovin.services import database
from booklovin.utils.user_token import get_from_token
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt

router = APIRouter(tags=["auth"])

NOT_FOUND = gen_error(ErrorCode.NOT_FOUND, details="User not found")
ALREADY_EXISTS = gen_error(ErrorCode.ALREADY_EXISTS, details="User already exists")
CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Incorrect username or password",
    headers={"WWW-Authenticate": "Bearer"},
)


@router.get("/me")
async def me_page(user: User = Depends(get_from_token)) -> User:
    return user


@router.post("/register")
async def register(request: Request, user: NewUser, response_model=None | UserError) -> None | UserError:
    existing_user = await database.users.get(db=request.app.state.db, email=user.email)
    if existing_user:
        return ALREADY_EXISTS
    passwd = pwd_context.hash(user.password)
    new_user = User(name=user.username, email=user.email, password=passwd)
    await database.users.create(db=request.app.state.db, user=new_user)
    return None


@router.post("/login", response_model=dict | UserError)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    user = await database.users.get(db=request.app.state.db, email=form_data.username)
    if not user:
        return NOT_FOUND

    if not user:
        raise CREDENTIALS_EXCEPTION

    hashed_password = user.password
    verification_passed = pwd_context.verify(form_data.password, hashed_password)

    if not hashed_password or not verification_passed:
        raise CREDENTIALS_EXCEPTION

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # The 'sub' (subject) claim is typically the user identifier (e.g., username or user ID)
    access_token = _create_access_token(data={"sub": form_data.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


def _create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
