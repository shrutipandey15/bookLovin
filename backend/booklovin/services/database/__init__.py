"""Database connector"""

import importlib

from booklovin.core import config
from booklovin.models.types import PostService, ServiceSetup, UserService

sub_services = ["post", "users"]
if config.DEBUG:
    sub_services.append("test_setup")


post: PostService
users: UserService


def init(backend: str) -> ServiceSetup:
    namespace = "booklovin.services.database"
    core = importlib.import_module(f".{backend}.core", namespace)
    db_config: ServiceSetup = core.init()
    globs = globals()
    for submodule in sub_services:
        m = importlib.import_module(f".{backend}.{submodule}", namespace)
        globs[submodule] = m
    return db_config
