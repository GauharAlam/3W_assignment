# Mini Social — Frontend

React (Vite) + Material UI feed for the 3W internship assignment.
No Tailwind — styling is MUI + plain CSS baseline.

## Quick start (local)

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev            # http://localhost:5173
```

Make sure the backend is running first.

## Pages

- `/` — public social feed (newest first, paginated “Load more”),
  create-post composer (text and/or photo), instant like/comment updates.
- `/login`, `/signup` — email + password auth, session persisted in localStorage.

## Deploy on Vercel / Netlify

**Vercel:**
1. Import the GitHub repo → Root Directory: `frontend`.
2. Framework preset: Vite. Build: `npm run build`, Output: `dist`.
3. Env var: `VITE_API_URL=https://<your-backend>.onrender.com/api`.
4. Deploy.

**Netlify:** same settings, publish directory `dist`,
add `_redirects` or SPA rewrite (`/* → /index.html`) — `netlify.toml` is included.
