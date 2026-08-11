# Setup & Troubleshooting Guide

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer (check with `node -v`)
- Any modern browser (Chrome, Edge, Firefox)
- No database installation required — the backend persists data to `backend/data/interns.json`

## 1. Run the backend

```bash
cd backend
npm install
npm start
```

You should see:

```
TeamPulse backend (Cognitive Layer) running on http://localhost:5000
Try it:  GET http://localhost:5000/api/interns
```

Confirm it's alive:

```bash
curl http://localhost:5000/api/health
# {"success":true,"message":"TeamPulse API is online."}
```

Optional: `npm run dev` uses `node --watch` to auto-restart on file changes while you edit `server.js`.

## 2. Run the frontend

The frontend is plain HTML/CSS/JS — no build step, no npm install needed. Two ways to open it:

**Option A — just open the file**
Double-click `frontend/index.html`, or open it via `File → Open` in your browser.

**Option B — serve it (recommended)**
Some browsers restrict `fetch()` from `file://` pages more aggressively. Serving avoids that:

```bash
cd frontend
npx serve .
# or
python3 -m http.server 5500
```

Then visit the printed URL (e.g. `http://localhost:5500`).

## 3. Confirm the connection

Look at the top-right status pill:

- 🟡 **Checking backend…** — request in flight
- 🟢 **Backend connected** — everything is wired up correctly
- 🔴 **Backend unreachable** — see troubleshooting below

## 4. Changing the backend port or URL

If you run the backend on a different port, or deploy it somewhere, update:

```js
// frontend/js/config.js
const CONFIG = Object.freeze({
  API_BASE_URL: 'http://localhost:5000/api', // <-- change this
  REQUEST_TIMEOUT_MS: 8000,
});
```

## 5. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Status pill stuck on "Checking backend…" | Backend isn't running | Run `npm start` inside `backend/` |
| `EADDRINUSE: address already in use :::5000` | Another process is already on port 5000 | Stop it, or run `PORT=5050 npm start` and update `config.js` to match |
| Browser console shows a CORS error | Backend `cors()` origin doesn't allow your frontend's origin | For local dev the backend already allows `*`; if you lock this down for deployment, set `origin` in `server.js` to your deployed frontend URL |
| "Backend unreachable" toast, but the API works via `curl` | Frontend `config.js` points at the wrong port/host | Double-check `API_BASE_URL` |
| Data resets after adding interns | `data/interns.json` is being overwritten by a fresh `git clone` / re-seed | This file **is** your database — back it up before resetting the repo |
| Port 5000 conflicts with macOS AirPlay Receiver | macOS uses 5000 for AirPlay | Turn off AirPlay Receiver in System Settings, or use `PORT=5050` |

## 6. Resetting the sample data

To restore the original five demo interns, replace the contents of `backend/data/interns.json` with the version tracked in the repository (or re-download this submission).
