# Backend

FastAPI backend for the Burmese manual money transaction app.

## Local Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Fill `.env` with your Supabase URL and service role key.

```bash
uvicorn app.main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

## Tests

```bash
pytest
```

## Render

Create a Render Web Service from this repo:

- Root directory: `backend`
- Runtime: Docker
- Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_ORIGIN`, `PORT`
- `FRONTEND_ORIGIN` should be your deployed frontend URL, for example `https://your-app.vercel.app`

Do not put the Supabase service role key in the frontend.
