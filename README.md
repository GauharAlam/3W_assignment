# Mini Social Post App — 3W Full-Stack Internship (Task 1)

A simple social feed inspired by the TaskPlanet app's Social Page:
accounts, text/image posts, public feed, likes and comments.

## Repo layout

```
backend/   # Node.js + Express + MongoDB API (see backend/README.md)
frontend/  # React (Vite) + Material UI (see frontend/README.md)
render.yaml
```

Only **two MongoDB collections** are used: `users` and `posts`
(likes/comments embedded with usernames).

## Run locally

```bash
# Terminal 1 — backend (needs MongoDB: local or Atlas)
cd backend && cp .env.example .env && npm install && npm run dev

# Terminal 2 — frontend
cd frontend && cp .env.example .env && npm install && npm run dev
```

Open http://localhost:5173 → sign up → login → create post → feed.
Feed is public; liking/commenting needs login and updates instantly.

## Deploy

- **Database:** MongoDB Atlas (free cluster) → connection string as `MONGO_URI`.
- **Backend:** Render (Root Directory `backend`, see `render.yaml` + `backend/README.md`).
- **Frontend:** Vercel or Netlify (Root Directory `frontend`,
  env `VITE_API_URL=https://<backend>/api`, see `frontend/README.md`).

## Verified

- Backend integration (in-memory MongoDB): signup/login, reject empty post,
  text + image posts, like toggle with usernames, comment with usernames,
  paginated feed — all passing.
- Frontend production build (`vite build`) — passing.
