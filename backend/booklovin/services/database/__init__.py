"""Database connector"""

import importlib

from booklovin.core import config
from booklovin.services.interfaces import PostService, ServiceSetup, UserService, JournalService
from booklovin.services.interfaces import ConfessionService
from booklovin.services.interfaces import ShelfService
from booklovin.services.interfaces import ProfileService

sub_services = ["post", "users", "journal", "letters", "confessions", "books", "profile"]
if config.DEBUG:
    sub_services.append("test_setup")


post: PostService
users: UserService
journal: JournalService
confessions: ConfessionService
def init(backend: str) -> ServiceSetup:
    namespace = "booklovin.services.database"
    core = importlib.import_module(f".{backend}.core", namespace)
    db_config: ServiceSetup = core.init()
    globs = globals()
    for submodule in sub_services:
        m = importlib.import_module(f".{backend}.{submodule}", namespace)
        globs[submodule] = m
    return db_config
