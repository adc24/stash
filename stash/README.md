# 📦 Stash

A personal toolbox to organise URLs into folders. Self-hosted, fast, and pretty.

- **Backend:** Flask + SQLite (zero external services)
- **Frontend:** React + Vite + Tailwind CSS + Framer Motion
- **Icons & UX:** Lucide, react-hot-toast, canvas-confetti

## Features

- Folders & links CRUD with cascade delete
- Auto-generated link names from URL (with friendly overrides for GitHub, Notion, Figma, Google Drive…)
- Live favicons (Google s2 service)
- Comma-separated tags rendered as filterable chips
- Sort: newest / oldest / A–Z / Z–A
- Live search across name, URL, and tags
- Light & dark theme (persists in localStorage)
- Keyboard shortcuts: `⌘N` new folder · `⌘L` new link · `Esc` close modal · `⌘⌫` delete
- Export / import all data as JSON
- Drag-to-bookmarks-bar Quick Capture → saves to an "Inbox" folder
- Subtle animations everywhere + a once-a-day confetti burst on the first link

## Run locally (manual)

### Backend (port 5000)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend (port 5173, proxies `/api` to Flask)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Run with Docker

```bash
docker compose up --build
```

Open http://localhost:5000. SQLite is persisted in the `stash-data` volume.

## Production build (single container)

The Dockerfile builds the React app and Flask serves the static files from `frontend/dist`, so the whole app runs on port 5000.

## Deploy to Render

`render.yaml` is included. It uses Docker and mounts a 1 GB persistent disk at `/data` so your SQLite database survives redeploys.

## API quick reference

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/folders` | list folders |
| POST | `/api/folders` | `{name}` |
| PUT | `/api/folders/:id` | rename |
| DELETE | `/api/folders/:id` | cascade delete links |
| GET | `/api/folders/:id/links` | list links |
| POST | `/api/folders/:id/links` | `{url, name?, tags?}` |
| PUT | `/api/links/:id` | partial update |
| DELETE | `/api/links/:id` | |
| GET | `/api/export` | downloads JSON |
| POST | `/api/import` | multipart `file` or raw JSON |
| GET | `/api/bookmarklet?url=&title=` | quick capture → "Inbox" |

## Bookmarklet

Inside the app there's a "Save to Stash" button — drag it to your bookmarks bar. Clicking it on any page opens a tiny window that saves the URL/title to your Inbox folder.

## License

MIT
