import os
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

from booklovin.utils import apply_env

DEBUG = "ENV_MODE" in os.environ and os.environ["ENV_MODE"] == "dev"

# DB
DB_TYPE = os.environ.get("DB_TYPE", "mongo")  # mongo or mock
DB_NAME = "booklovin_test" if DEBUG else "booklovin"
# MONGO
MONGO_SERVER = (os.environ["MONGO_HOST"], int(os.environ["MONGO_PORT"]))
# REDIS
REDIS_SERVER = (os.environ["REDIS_HOST"], int(os.environ["REDIS_PORT"]))

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
