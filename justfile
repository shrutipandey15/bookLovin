set dotenv-required

# Run both servers
all:
    just serve &
    cd frontend && npm run dev

# Setup frontend & backend
install:
    cd backend && poetry install
    cd frontend && npm i

# run the server
serve:
    cd backend && poetry run uvicorn booklovin.main:booklovin --reload

# run tests
test args='':
    just frontend_test
    just backend_test

frontend_test args='':
    cd frontend && npm run test_once {{args}}

backend_test args='':
    cd backend && poetry run pytest -v booklovin/tests {{args}}

profile:
    cd backend && poetry run python -m cProfile -s cumtime -m pytest booklovin/tests

# run tests and throw gdb on error
debug args='':
    cd backend && poetry run pytest -v booklovin/tests --pdb {{args}}

# run type checking
checktypes:
    cd backend && poetry run mypy --install-types -p booklovin

# check for dead code using vulture
checkcoverage:
    cd backend && poetry run vulture booklovin

# check if API contracts are respected
checkprotocols:
    cd backend && poetry run python ../scripts/validator_db_protocols.py

# generate static docs
docs:
    cd backend && poetry run pdoc -d google booklovin -o docs

# check everything
checkall:
    just checkprotocols
    cd frontend && npm run test_once
    ./scripts/run_backend_unit_tests_allbackends
    just checkcoverage
    just checktypes

# populate the database
populate:
    cd backend && poetry run ./scripts/populator2.py

# print Javascript representation backend Enumerated types
api_enums:
    cd backend && poetry run ./scripts/dump_enums.py | tee ../frontend/src/constants/enumTypes.js | pygmentize -l js
