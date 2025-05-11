from booklovin.core.config import oauth2_scheme
from booklovin.core.settings import SECRET_KEY, ALGORITHM
from booklovin.models.users import User
from booklovin.services.database import users
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt

CredentialsException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


# Dependency to get the current user from the token
async def get_from_token(request: Request, token: str = Depends(oauth2_scheme)) -> User | None:
    # Decode the token to get the user ID
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise CredentialsException
    except JWTError as exc:
        raise CredentialsException from exc
    else:
        user = await users.get(db=request.app.state.db, email=user_id)
        if user is None:
            raise CredentialsException
        return user
