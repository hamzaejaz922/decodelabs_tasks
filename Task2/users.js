/**
 * data/users.js
 * -------------------------------------------------------
 * This is our "database" for the project.
 *
 * Project 2 only asks for a SIMPLE backend API, so instead of
 * connecting a real database (that's Project 3+ territory),
 * we keep everything in memory inside this array.
 *
 * Every function in controllers/userController.js reads from
 * and writes to this single array. If the server restarts,
 * the data resets — that's expected and fine for this stage
 * (see slide: "Statelessness - the ability to regenerate/restart").
 * -------------------------------------------------------
 */

let users = [
  { id: 1, name: "Muhammad Hamza", email: "muhammad.hamza@example.com", role: "admin" },
  { id: 2, name: "Muhammad Mahad", email: "muhammad.mahad@example.com", role: "user" },
  { id: 3, name: "Muhammad Fahad", email: "muhammad.fahad@example.com", role: "user" },
];

// Keeps track of the next id to assign to a new user
let nextId = 4;

function getNextId() {
  return nextId++;
}

module.exports = { users, getNextId };
