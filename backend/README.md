# Mini Social — Backend API

Express + MongoDB API for the 3W Full-Stack Internship assignment (Task 1).

Uses **exactly two MongoDB collections**: `users` and `posts`
(likes + comments are embedded in the post document, usernames saved).

## Quick start (local)

```bash
cd backend
cp .env.example .env   # set MONGO_URI + JWT_SECRET
npm install
npm run dev            # http://localhost:5000
```

Health check: `GET /api/health`

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | – | `{username, email, password}` → `{token, user}` |
| POST | `/api/auth/login` | – | `{email, password}` → `{token, user}` |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/posts?page=1&limit=10` | – | Public feed, newest first, paginated |
| POST | `/api/posts` | ✅ | `{text, imageUrl}` JSON **or** multipart `text` + `image` file. Text and/or image (either one is enough) |
| POST | `/api/posts/:id/like` | ✅ | Toggle like → `{post, liked}` |
| POST | `/api/posts/:id/comments` | ✅ | `{text}` → `{post}` |
| DELETE | `/api/posts/:id` | ✅ | Owner only |

Post shape includes `likeCount`, `commentCount`, `likedByMe`, and embedded
`likes: [{user, username}]`, `comments: [{user, username, text}]`.

## Env vars

See `.env.example`: `PORT`, `MONGO_URI` (MongoDB Atlas), `JWT_SECRET`,
`JWT_EXPIRES_IN`, `CLIENT_URL`, `JSON_LIMIT`.

## Deploy on Render

1. Push this repo to GitHub.
2. Render → New → Web Service → select repo, Root Directory: `backend`.
3. Build: `npm install`, Start: `npm start`, Node 18+.
4. Add env vars: `MONGO_URI` (Atlas), `JWT_SECRET` (long random),
   `CLIENT_URL` (your Vercel URL), `JSON_LIMIT=8mb`.
