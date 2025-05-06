from booklovin.models.users import User
from booklovin.services.database.mock.core import State


def setup(user_data):
    state = State()
    state.users.append(User(**user_data))
    state.save()
