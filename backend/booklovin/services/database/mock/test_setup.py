from booklovin.models.users import User
from booklovin.services.database.mock.core import state


def setup(user_data):
    state.users.append(User(**user_data))
