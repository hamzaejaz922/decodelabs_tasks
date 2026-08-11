# API Documentation — TeamPulse Intern Console

Base URL (local development): `http://localhost:5000/api`

All responses are JSON and follow one of two shapes:

```jsonc
// success
{ "success": true, "data": { /* ... */ } }

// failure
{ "success": false, "error": "SOME_ERROR_CODE", "message": "Human-readable explanation." }
```

---

## `GET /health`

Liveness check.

**Response `200`**
```json
{ "success": true, "message": "TeamPulse API is online." }
```

---

## `GET /interns`

List interns. Supports optional query parameters, combinable:

| Param        | Example                    | Behavior                              |
|--------------|-----------------------------|----------------------------------------|
| `search`     | `?search=aye`               | Matches name, role, or email (case-insensitive substring) |
| `department` | `?department=Engineering`   | Exact match, case-insensitive         |
| `status`     | `?status=active`            | `active` or `on-leave`                |

**Response `200`**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "e1a1",
      "name": "Muhammad Hamza",
      "role": "Frontend Developer Intern",
      "department": "Engineering",
      "email": "muhammad.hamza@teampulse.dev",
      "status": "active",
      "joined": "2026-01-12"
    }
  ]
}
```

---

## `GET /interns/stats`

Aggregated numbers for the dashboard.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "active": 4,
    "onLeave": 1,
    "byDepartment": {
      "Engineering": 2,
      "Design": 1,
      "Quality Assurance": 1,
      "Data": 1
    }
  }
}
```

---

## `GET /interns/:id`

**Response `200`** — same shape as one item above.
**Response `404`**
```json
{ "success": false, "error": "NOT_FOUND", "message": "No intern found with id \"xyz\"." }
```

---

## `POST /interns`

Create a new intern. Not idempotent — calling twice creates two records.

**Request body**
```json
{
  "name": "Zara Iqbal",
  "role": "Backend Developer Intern",
  "department": "Engineering",
  "email": "zara.iqbal@teampulse.dev",
  "status": "active"
}
```
`status` is optional and defaults to `"active"`. `id` and `joined` are generated server-side.

**Response `201`**
```json
{
  "success": true,
  "data": {
    "id": "7f2a9c31",
    "name": "Zara Iqbal",
    "role": "Backend Developer Intern",
    "department": "Engineering",
    "email": "zara.iqbal@teampulse.dev",
    "status": "active",
    "joined": "2026-08-10"
  }
}
```

**Response `400`** (missing/invalid fields)
```json
{ "success": false, "error": "BAD_REQUEST", "message": "Fields \"name\", \"role\", \"department\" and \"email\" are required." }
```

---

## `PUT /interns/:id`

Full replacement. Idempotent — same payload, same end state, safe to retry.

**Request body** — all of `name`, `role`, `department`, `email` are required; `status` optional.

**Response `200`** — the updated record.
**Response `404`** — unknown id.
**Response `400`** — missing required field.

---

## `PATCH /interns/:id`

Partial update — send only the field(s) you want to change.

**Request body**
```json
{ "status": "on-leave" }
```

**Response `200`** — the updated record.
**Response `400`**
```json
{ "success": false, "error": "BAD_REQUEST", "message": "Provide at least one field to update." }
```

---

## `DELETE /interns/:id`

Removes the record. Idempotent in effect — deleting a non-existent id consistently returns `404`.

**Response `200`**
```json
{ "success": true, "data": { "...": "the deleted record" }, "message": "Intern removed." }
```
**Response `404`** — unknown id.

---

## Status code reference used throughout this API

| Code | Meaning | When it's returned |
|------|---------|---------------------|
| 200  | OK | Successful GET / PUT / PATCH / DELETE |
| 201  | Created | Successful POST |
| 400  | Bad Request | Missing/invalid fields in the request body |
| 404  | Not Found | Unknown `:id`, or an unmatched route entirely |
| 500  | Internal Server Error | Uncaught exception — handled by the centralized error middleware in `server.js` |

## cURL examples

```bash
# List
curl http://localhost:5000/api/interns

# Filter
curl "http://localhost:5000/api/interns?department=Engineering&status=active"

# Create
curl -X POST http://localhost:5000/api/interns \
  -H "Content-Type: application/json" \
  -d '{"name":"Zara Iqbal","role":"Backend Developer Intern","department":"Engineering","email":"zara.iqbal@teampulse.dev"}'

# Partial update
curl -X PATCH http://localhost:5000/api/interns/e1a1 \
  -H "Content-Type: application/json" \
  -d '{"status":"on-leave"}'

# Delete
curl -X DELETE http://localhost:5000/api/interns/e1a1
```
