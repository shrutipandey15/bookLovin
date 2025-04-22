from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

MONGO_SERVER = ("localhost", 27017)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create a dummy user for testing
TEST_USERNAME = "dummy@dummy.com"
TEST_PASSWORD = "password"
HASHED_PASSWORD = pwd_context.hash(TEST_PASSWORD)
