# Tazarzit Bio — Backend

FastAPI + PostgreSQL (`tazarzitbio`) + SQLModel + Alembic.

## Local setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health: http://localhost:8000/health  
API v1: http://localhost:8000/api/v1/health

## Tests

```bash
pytest
```
