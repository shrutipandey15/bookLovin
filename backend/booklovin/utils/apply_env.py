"""Loads the .env file in the current process.
Purposely executes on import and starts with an "a" to maximize
the changes of running as early as possible without breaking style."""

import os

# search for .env in current folder, then parents
env_file = None
cur_path = os.path.dirname(__file__)
while True:
    fname = os.path.join(cur_path, ".env")
    if os.path.exists(fname):
        env_file = fname
        break
    cur_path = os.path.dirname(cur_path)
    if cur_path == "/":
        break
if env_file:
    for line in open(env_file):
        if line.startswith("#") or not line.strip():
            continue
        key, value = [x.strip() for x in line.strip().split("=", 1)]
        os.environ[key] = value
