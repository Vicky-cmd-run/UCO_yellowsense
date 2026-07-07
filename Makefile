.PHONY: install run-dev docker-up docker-down seed reset-demo test lint format

install:
	cd apps/web && npm install
	cd apps/api && pip install -e .

run-backend:
	cd apps/api && uvicorn app.main:app --reload --port 8000

run-frontend:
	cd apps/web && npm run dev -- --port 3000

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down

seed:
	cd apps/api && python -m app.db.seed

reset-demo:
	cd apps/api && python -m app.db.seed --reset

test-backend:
	cd apps/api && pytest

test-frontend:
	cd apps/web && npm run test

test: test-backend test-frontend

lint:
	cd apps/api && ruff check .
	cd apps/web && npm run lint

format:
	cd apps/api && ruff format .
