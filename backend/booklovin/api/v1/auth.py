from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from jose import JWTError, jwt

from booklovin.models.users import UserLogin, User
from booklovin.services.users_service import get_user
from booklovin.core.config import oauth2_scheme, pwd_context

SECRET_KEY = "development key"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ALGORITHM = "HS256"


router = APIRouter(tags=["auth"])


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


# Dependency to get the current user from the token
async def get_from_token(token: str = Depends(oauth2_scheme)) -> User | None:
    # Decode the token to get the user ID
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise CredentialsException
    except JWTError:
        raise CredentialsException
    else:
        user = await get_user(email=user_id)
        if user is None:
            raise CredentialsException
        return user


@router.get("/test")
async def test(user: User = Depends(get_from_token)) -> UserLogin:
    return user


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

    if not hashed_password or not pwd_context.verify(
        form_data.password, hashed_password
    ):
        raise credentials_exception

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # The 'sub' (subject) claim is typically the user identifier (e.g., username or user ID)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


CredentialsException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)
