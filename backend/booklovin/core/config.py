import os
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from booklovin.utils import apply_env

DEBUG = "ENV_MODE" in os.environ and os.environ["ENV_MODE"] == "dev"

# DB
DB_TYPE = "mongo"
MONGO_SERVER = (os.environ["MONGO_HOST"], int(os.environ["MONGO_PORT"]))
DB_NAME = "booklovin_test" if DEBUG else "booklovin"

# PASSWORD
SECRET_KEY = "ABCD" if DEBUG else os.getenv("TOKEN_SECRET_KEY", "CHANGE ME")
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ALGORITHM = "HS256"


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Test data
TEST_USERNAME = "dummy@dummy.com"
TEST_PASSWORD = "password"


def get_test_password():
    return pwd_context.hash(TEST_PASSWORD)


REACT_DEV_SERVER = "http://localhost:5173"
