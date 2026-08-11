# TeamPulse · Project 4 — Frontend & Backend Integration

**Intern Console** — a full-stack CRUD application that connects a vanilla JavaScript frontend to a REST API built with Node.js and Express, demonstrating the complete Input → Process → Output (I‑P‑O) lifecycle covered in Project 4 of the TeamPulse Full Stack Developer internship.

> Optional Mastery Phase submission — Full Stack Developer track
> Level: Semester 4–5 · Track: Frontend & Backend Integration

![status](https://img.shields.io/badge/status-submission--ready-2DD4C8) ![node](https://img.shields.io/badge/node-%3E%3D18-informational) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 1. What this project is

TeamPulse runs an internal roster of interns across departments (Engineering, Design, QA, Data…). This project is a small internal tool — the **Intern Console** — that lets a coordinator view, search, filter, add, edit and remove intern records, backed by a real HTTP API instead of hard-coded data.

It was built specifically to satisfy Project 4's key requirements:

| Requirement (from the brief)          | Where it's implemented |
|----------------------------------------|-------------------------|
| Send requests from frontend to backend | `frontend/js/api.js` — every mutation and read goes through `fetch()` |
| Display dynamic data on the UI         | `frontend/js/ui.js` — DOM built at runtime from JSON, no static markup |
| Handle basic errors and responses      | `try/catch/finally` shield in `app.js`, `response.ok` checks in `api.js`, HTTP status codes in `server.js` |
| API integration                        | Full REST resource `/api/interns` (GET, POST, PUT, PATCH, DELETE) |
| Asynchronous requests                  | `async/await` throughout — no `.then()` chains, no callback nesting |
| Full stack flow                        | Express backend + vanilla JS frontend, connected over CORS |

## 2. Feature list

Beyond the minimum brief, this build adds the layer of polish expected at a professional/senior level:

- **Full CRUD**, not just read — Create, Read, Update (full `PUT` + partial `PATCH`), Delete
- **Live stats dashboard** — total interns, active count, on-leave count, department count (its own aggregated endpoint, fetched in parallel with the list via `Promise.all`)
- **Search + filters** — debounced text search, department filter, status filter, all combined client-side against the fetched dataset
- **Optimistic-feeling UX** — skeleton loading states, toast notifications, disabled buttons + inline "Saving…" labels while a request is in flight
- **Defensive programming** — centralized `ApiError` class, request timeout via `AbortController`, a dedicated error/fallback screen (never a blank white page), and a server-side error-handling middleware that never leaks stack traces
- **Security-conscious DOM injection** — every dynamic value is written with `textContent`/`createElement`, never `innerHTML`, to close the XSS hole covered in the training material
- **Light / dark theme** — a single CSS custom-property token system drives both themes; the choice is remembered in `localStorage` and respects the OS preference on first load
- **RESTful correctness** — nouns-only routes, correct verbs, correct status codes (`200`, `201`, `400`, `404`, `500`), explicit CORS configuration
- **Responsive layout** — usable from a phone up to a wide desktop; respects `prefers-reduced-motion`

## 3. Architecture

```
Browser (Frontend)                         Server (Backend)
┌─────────────────────────┐   fetch()     ┌──────────────────────────┐
│ index.html               │ ───────────▶ │ Express app (server.js)  │
│  css/style.css (themes)  │               │  CORS, JSON body parser  │
│  js/config.js            │               │  /api/interns  (CRUD)    │
│  js/api.js  (fetch layer)│ ◀─────────── │  /api/interns/stats      │
│  js/ui.js   (DOM render) │   JSON        │  /api/health             │
│  js/app.js  (controller) │               │  data/interns.json (DB) │
└─────────────────────────┘               └──────────────────────────┘
```

This mirrors the **I‑P‑O model** taught in the module:

1. **Input** — a user action (click "Refresh", submit the form) triggers an `async` function that calls `fetch()`.
2. **Process** — the Express server routes the request, validates it, reads/writes `data/interns.json`, and serializes a JSON response.
3. **Output** — the frontend parses the JSON with `response.json()` and injects it into the DOM.

## 4. Tech stack

| Layer      | Choice                          | Why |
|------------|----------------------------------|-----|
| Backend    | Node.js + Express + `cors`       | Minimal, industry-standard REST setup; easy to read for a review |
| Storage    | JSON file (`data/interns.json`)  | No database server required to run/grade the project; swap for MongoDB/Postgres later without changing the API contract |
| Frontend   | Vanilla HTML/CSS/JavaScript      | No build step — open it and it works; keeps the fetch/async logic front and center instead of hidden behind a framework |
| Fonts      | Space Grotesk, Inter, JetBrains Mono (Google Fonts) | Distinct display/body/mono roles for a professional dashboard feel |

## 5. Project structure

```
teampulse-project4/
├── backend/
│   ├── server.js            REST API (Express)
│   ├── package.json
│   ├── .gitignore
│   └── data/
│       └── interns.json     Seed data / persistent JSON "database"
├── frontend/
│   ├── index.html           App shell + modal + toast container
│   ├── css/
│   │   └── style.css        Design tokens, light/dark themes, layout
│   └── js/
│       ├── config.js        API base URL / timeout config
│       ├── api.js           fetch() wrapper, ApiError, timeout handling
│       ├── ui.js             DOM rendering, theme toggle, toasts
│       └── app.js            State, event wiring, CRUD flows
├── API_DOCUMENTATION.md
├── SETUP.md
└── README.md                 ← you are here
```

## 6. Quick start

```bash
# 1. Backend
cd backend
npm install
npm start          # runs on http://localhost:5000

# 2. Frontend (in a second terminal)
cd frontend
# open index.html directly, or serve it so relative paths behave in all browsers:
npx serve .         # or: python3 -m http.server 5500
```

Then visit the frontend URL in your browser. The status pill in the top-right will read **"Backend connected"** once the two are talking. See `SETUP.md` for troubleshooting (CORS, ports, etc).

## 7. API summary

Full request/response examples are in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

| Method | Route                | Purpose                     | Idempotent |
|--------|-----------------------|------------------------------|:----------:|
| GET    | `/api/interns`         | List interns (supports `?search=&department=&status=`) | ✅ |
| GET    | `/api/interns/stats`   | Aggregated dashboard numbers | ✅ |
| GET    | `/api/interns/:id`     | Get one intern               | ✅ |
| POST   | `/api/interns`         | Create an intern             | ❌ |
| PUT    | `/api/interns/:id`     | Replace an intern            | ✅ |
| PATCH  | `/api/interns/:id`     | Partially update an intern   | ❌ |
| DELETE | `/api/interns/:id`     | Remove an intern             | ✅ |

## 8. What this project demonstrates (for the reviewer)

- Correct use of `async`/`await` over Promise chains or callbacks
- `response.ok` checked **before** parsing JSON, on every request (avoids the "assumed 404 throws" anti-pattern)
- Parallel independent requests via `Promise.all()` instead of sequential `await` in a loop
- A `try / catch / finally` shield around every network call, with `finally` used to reset loading/disabled UI state regardless of outcome
- Safe DOM injection (`textContent` / `createElement`, not `innerHTML`)
- RESTful resource naming and correct HTTP status codes
- CORS configured explicitly on the server rather than worked around
- A visual design system (light + dark, one shared token set) rather than default browser styling

## 9. Possible next steps (not required for submission)

- Swap the JSON file for MongoDB/PostgreSQL behind the same route contract
- Add authentication (JWT) and protect the mutating routes
- Add pagination to `/api/interns` for larger datasets
- Write automated tests (Jest + Supertest for the API, Playwright for the UI)

## 10. Author's note

Built as Project 4 of the TeamPulse Full Stack Developer remote internship (Optional Mastery Phase). The goal wasn't just to satisfy the three key requirements, but to show the full discipline around them: validation, error handling, RESTful design, and a UI that doesn't fall apart the moment the network misbehaves.

---
<sub>License: MIT — free to reuse for learning purposes.</sub>
