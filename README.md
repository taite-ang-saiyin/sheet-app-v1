# Burmese Money Transaction Record App

A mobile-first manual money record app for a parent. It uses:

- Frontend: React + Vite with clean mobile-first CSS
- Backend: Python FastAPI
- Database: Supabase PostgreSQL
- No OCR, no Google Sheets, no image upload, no machine learning

## Project Structure

```text
backend/    FastAPI API, validation, Supabase service layer, tests, Dockerfile
frontend/   React Vite Burmese mobile web app
supabase/   SQL migration
```

## 1. Create the Supabase Table

1. Create a Supabase project.
2. Open Supabase Dashboard → SQL Editor.
3. Paste and run `supabase/migrations/001_create_transactions.sql`.
4. Confirm the `transactions` table exists.

If you already created the table before whole-kyat rounding was added, also run:

```text
supabase/migrations/002_round_amounts_to_whole_kyat.sql
```

Amounts are stored as whole kyat. For example, `99999.98` is rounded and saved as `100000`.

The app uses the Supabase service role key only in the backend. Never put it in Vercel, Netlify, or any frontend environment variable.

## 2. Configure Environment Variables

Backend `.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key-if-needed
FRONTEND_ORIGIN=http://localhost:5173
PORT=8000
LOG_LEVEL=INFO
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

For production, set `FRONTEND_ORIGIN` to your deployed frontend URL and `VITE_API_BASE_URL` to your deployed backend URL.

## 3. Run Backend Locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Check:

```bash
curl http://localhost:8000/health
```

## 4. Run Frontend Locally

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## 5. Deploy Backend to Render

1. Push the repo to GitHub.
2. Create a Render Web Service.
3. Set root directory to `backend`.
4. Choose Docker runtime.
5. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_ORIGIN`
   - `PORT` with value `8000`
6. Deploy and open `/health`.

## 6. Deploy Frontend

Vercel or Netlify:

- Root directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://your-render-backend.onrender.com`

Render static site:

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`

After frontend deployment, update Render backend `FRONTEND_ORIGIN` to the frontend domain and redeploy the backend.

## 7. Use on an iPhone

1. Open the deployed frontend URL in Safari.
2. Tap Share → Add to Home Screen.
3. Open it like a normal app.
4. Use `စာရင်းသွင်း` to save records, `မှတ်တမ်း` to search/edit/delete, `စာရွက်` to view an Excel-like table, and `စုစုပေါင်း` to view totals.

The UI is designed with large touch targets, native date inputs, simple cards, and lightweight CSS for older iPhone Safari.

## Tests

Backend:

```bash
cd backend
pytest
```

Frontend build check:

```bash
cd frontend
npm run build
```

## V2 Improvements

- Add PIN/passcode protection.
- Add monthly export to CSV or PDF.
- Add simple month filter on the dashboard.
- Add offline draft saving for weak internet.
- Add user accounts only if more than one person needs separate records.
