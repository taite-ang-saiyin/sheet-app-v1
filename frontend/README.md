# Frontend

React + Vite mobile web app in Burmese.

## Local Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Environment

`VITE_API_BASE_URL` must point to the FastAPI backend URL.

For production:

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

Do not add Supabase keys to frontend environment variables.

## Deployment

Vercel or Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_BASE_URL`

Render static site:

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
