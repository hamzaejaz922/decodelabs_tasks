/**
 * routes/userRoutes.js
 * -------------------------------------------------------
 * Slide reference: "The Language of Nerves: RESTful Naming"
 *   -> "Resources are Nouns. Methods are Verbs."
 *
 * Notice every URL below is just the noun "/users" (a resource).
 * The ACTION (get / create / update / delete) is expressed by
 * the HTTP method, never by the URL itself.
 *
 *   CORRECT:    GET /api/users        (not GET /api/getUsers)
 *   CORRECT:    POST /api/users       (not POST /api/createUser)
 *   CORRECT:    DELETE /api/users/:id (not GET /api/deleteUser?id=1)
 * -------------------------------------------------------
 */

const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const validateUser = require("../middleware/validateUser");

router.get("/", getAllUsers);          // GET    /api/users
router.get("/:id", getUserById);       // GET    /api/users/:id
router.post("/", validateUser, createUser);      // POST   /api/users
router.put("/:id", validateUser, updateUser);    // PUT    /api/users/:id
router.delete("/:id", deleteUser);     // DELETE /api/users/:id

module.exports = router;
