import logging
import os

from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import ORJSONResponse, JSONResponse

logger = logging.getLogger(__name__)

DEBUG = "ENV_MODE" in os.environ and os.environ["ENV_MODE"] == "dev"

logger.info(f"Debug mode: {DEBUG}")
# DB
AVAILABLE_DB_ENGINES = ("mock", "mongo")
DB_TYPE = os.environ.get("DB_TYPE", "mongo")  # mongo or mock
DB_NAME = "booklovin_test" if DEBUG else "booklovin"
logger.info(f"Database: {DB_TYPE.upper()}::{DB_NAME}")
# MONGO
MONGO_SERVER = (os.environ.get("MONGO_HOST", "localhost"), int(os.environ.get("MONGO_PORT", "27017")))
# REDIS
REDIS_SERVER = (os.environ.get("REDIS_HOST", "localhost"), int(os.environ.get("REDIS_PORT", "6379")))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Test data
TEST_USERNAME = "dummy@dummy.com"
TEST_PASSWORD = "password"


def get_test_password():
    return pwd_context.hash(TEST_PASSWORD)


REACT_DEV_SERVER = "http://localhost:5173"


APIResponse = JSONResponse if DEBUG else ORJSONResponse
