import os
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi.encoders import jsonable_encoder
from fastapi.responses import ORJSONResponse

DEBUG = "ENV_MODE" in os.environ and os.environ["ENV_MODE"] == "dev"

print(f"debug mode: {DEBUG}")
# DB
AVAILABLE_DB_ENGINES = ("mock", "mongo", "redis")
DB_TYPE = os.environ.get("DB_TYPE", "mongo")  # mongo or mock
DB_NAME = "booklovin_test" if DEBUG else "booklovin"
print(f"Database: {DB_TYPE.upper()}::{DB_NAME}")
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


class ValidatedResponse(ORJSONResponse):
    def __init__(self, content: dict, **kw):
        super().__init__(content=jsonable_encoder(content), **kw)


APIResponse = ValidatedResponse if DEBUG else ORJSONResponse
