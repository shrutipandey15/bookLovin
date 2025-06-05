"""Contains the website settings"""

import os

from booklovin.core.config import DEBUG

RECENT_POSTS_LIMIT = 10

# PASSWORD
SECRET_KEY = os.getenv("TOKEN_SECRET_KEY", "CHANGE ME")
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60 # 30 days (need to discuss with my dummy)
ALGORITHM = "HS256"
