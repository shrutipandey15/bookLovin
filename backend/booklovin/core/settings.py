"""Contains the website settings"""

import os

from booklovin.core.config import DEBUG

RECENT_POSTS_LIMIT = 10

# PASSWORD
_secret_key = os.getenv("TOKEN_SECRET_KEY")
if not _secret_key:
    if DEBUG:
        _secret_key = "dev-only-insecure-key-do-not-use-in-production"
    else:
        raise RuntimeError("TOKEN_SECRET_KEY environment variable must be set in production")
SECRET_KEY = _secret_key
ACCESS_TOKEN_EXPIRE_MINUTES = 7 * 24 * 60  # 7 days
ALGORITHM = "HS256"
