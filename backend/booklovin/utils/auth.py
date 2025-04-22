from booklovin.core.config import oauth2_scheme, SECRET_KEY, ALGORITHM
from booklovin.models.users import User
from booklovin.services.users_service import get_user
from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt

CredentialsException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


# Dependency to get the current user from the token
async def get_from_token(token: str = Depends(oauth2_scheme)) -> User | None:
    # Decode the token to get the user ID
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise CredentialsException
    except JWTError as exc:
        raise CredentialsException from exc
    else:
        user = await get_user(email=user_id)
        if user is None:
            raise CredentialsException
        return user
