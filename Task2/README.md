# DecodeLabs User API — Project 2: Backend API Development

A simple, well-structured REST API built with **Node.js + Express**, created to satisfy the requirements of the DecodeLabs Full Stack Development Internship Kit — Project 2.

> Project 1 was the skin (frontend). Project 2 is the life (backend). This project handles application logic — receiving requests, validating data, and returning consistent, predictable responses.

---

## ✅ Requirements Checklist (mapped from the project brief)

| Requirement | Where it's implemented |
|---|---|
| Create API endpoints (GET / POST) | `routes/userRoutes.js` — also includes PUT/DELETE for a complete CRUD demo |
| Handle user input and responses | `controllers/userController.js` |
| Validate basic data | `middleware/validateUser.js` |
| RESTful naming (nouns, not verbs) | All routes use `/api/users`, never `/api/getUsers` |
| Correct HTTP status codes | 200, 201, 204, 400, 404, 500 used throughout |
| Documentation | This README |

---

## 📁 Project Structure

```
user-api/
├── controllers/
│   └── userController.js   # Business logic for each endpoint
├── middleware/
│   ├── validateUser.js     # Input validation ("never trust the client")
│   └── errorHandler.js     # 404 + 500 handling
├── routes/
│   └── userRoutes.js       # Maps URLs -> controller functions
├── data/
│   └── users.js            # In-memory "database" (array of users)
├── public/
│   └── index.html           # Optional demo frontend (not required by the brief)
├── server.js                # App entry point
├── package.json
└── README.md
```

> **Note on the frontend:** Project 2's brief is scoped to the *backend* only (see slide: "Project 1 was the skin. Project 2 is the life."). The `public/index.html` page is an **optional bonus** — a small demo UI to visually test the API (list, add, delete users) without needing Postman. It is not a project requirement.

---

## 🚀 How to Run

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```
   You should see:
   ```
   🚀 Server is running at http://localhost:3000
   ```

3. **Test it**:
   - Open `http://localhost:3000/` in a browser → optional demo frontend (add/view/delete users visually)
   - Open `http://localhost:3000/api/health` → confirms the API itself is alive
   - Or use the endpoints below with a tool like **Postman**, **Insomnia**, or `curl`

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/api/users`

### 1. Get all users
```
GET /api/users
```
**Response — 200 OK**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 1, "name": "Ali Raza", "email": "ali.raza@example.com", "role": "admin" }
  ]
}
```

### 2. Get a single user
```
GET /api/users/:id
```
- **200 OK** if found
- **404 Not Found** if the id doesn't exist

### 3. Create a new user
```
POST /api/users
Content-Type: application/json

{
  "name": "Zainab Iqbal",
  "email": "zainab@example.com",
  "role": "admin"
}
```
- **201 Created** on success, returns the new user (with generated `id`)
- **400 Bad Request** if `name`/`email` missing, or email is badly formatted, or `role` isn't `admin`/`user`

### 4. Update an existing user
```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```
- **200 OK** on success
- **404 Not Found** if the id doesn't exist
- **400 Bad Request** if validation fails

### 5. Delete a user
```
DELETE /api/users/:id
```
- **204 No Content** on success (nothing returned — the resource is gone)
- **404 Not Found** if the id doesn't exist

---

## 🧠 Design Concepts Applied (from the project brief)

- **RESTful naming** — resources are nouns (`/users`), HTTP methods are verbs (GET/POST/PUT/DELETE). We never write `/getUsers` or `/createUser`.
- **The Gatekeeper Rule** — no data from the client is trusted. `validateUser.js` checks both:
  - *Syntactic validation*: are required fields present and the right type?
  - *Semantic validation*: does the data actually make sense (valid email format, allowed role)?
- **Statelessness** — the server holds no session/memory of "who asked last time." Every request carries everything needed to process it.
- **Correct status codes** — every response uses the status code that actually matches what happened, so the client never has to "guess":
  - `200` OK — a normal successful GET/PUT
  - `201` Created — a new resource was made
  - `204` No Content — success, nothing to send back (DELETE)
  - `400` Bad Request — the client sent invalid data
  - `404` Not Found — resource/route doesn't exist
  - `500` Internal Server Error — something broke on the server side
- **Centralized error handling** — a single `errorHandler` middleware catches unexpected crashes so one bad request can never take down the whole server.

---

## 🧪 Example Test Flow (using curl)

```bash
# Get all users
curl http://localhost:3000/api/users

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Zainab Iqbal","email":"zainab@example.com","role":"admin"}'

# Try invalid data (expect 400)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bad Email","email":"not-an-email"}'

# Update a user
curl -X PUT http://localhost:3000/api/users/2 \
  -H "Content-Type: application/json" \
  -d '{"name":"Sara Khan Updated","email":"sara.updated@example.com"}'

# Delete a user
curl -X DELETE http://localhost:3000/api/users/3
```

---

## 📌 Notes / Possible Extensions

This project intentionally uses an **in-memory array** instead of a real database, since Project 2's brief scopes this stage to *"a simple backend API"* — database integration is the natural next milestone. Ideas to extend it further:

- Swap `data/users.js` for a real database (MongoDB/PostgreSQL)
- Add authentication (`AuthN`) and authorization (`AuthZ`) middleware
- Add pagination to `GET /api/users`
- Add rate limiting (`429 Too Many Requests`)
- Write automated tests with Jest + Supertest

---

**Built for:** DecodeLabs Full Stack Development — Industrial Training Kit, Batch 2026
