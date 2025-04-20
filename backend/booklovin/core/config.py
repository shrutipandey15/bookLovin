from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
