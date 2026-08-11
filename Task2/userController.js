/**
 * controllers/userController.js
 * -------------------------------------------------------
 * Slide reference: "Anatomy of Action: HTTP Methods" +
 * "Critical Vocabulary: Essential Status Codes"
 *
 * This is the "brain" — the actual application logic that
 * decides what happens for each request. Routes just point
 * here; all the real work happens in these functions.
 *
 * Each function follows the same shape:
 *   (req, res) => { ...do the work..., res.status(code).json(data) }
 * -------------------------------------------------------
 */

const { users, getNextId } = require("../data/users");

// GET /api/users
// Retrieval. Safe. Idempotent.
function getAllUsers(req, res) {
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
}

// GET /api/users/:id
function getUserById(req, res) {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `User with id ${id} not found.`,
    });
  }

  res.status(200).json({ success: true, data: user });
}

// POST /api/users
// Creation. Unsafe. Non-idempotent (calling it twice creates 2 users).
function createUser(req, res) {
  const { name, email, role } = req.body;

  const newUser = {
    id: getNextId(),
    name: name.trim(),
    email: email.trim(),
    role: role || "user", // default role if none given
  };

  users.push(newUser);

  // 201 Created + the new resource in the response body
  res.status(201).json({
    success: true,
    message: "User created successfully.",
    data: newUser,
  });
}

// PUT /api/users/:id
// Update / Replacement.
function updateUser(req, res) {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `User with id ${id} not found.`,
    });
  }

  const { name, email, role } = req.body;

  user.name = name.trim();
  user.email = email.trim();
  if (role) user.role = role;

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    data: user,
  });
}

// DELETE /api/users/:id
// Removal.
function deleteUser(req, res) {
  const id = Number(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `User with id ${id} not found.`,
    });
  }

  users.splice(index, 1);

  // 204 No Content = success, nothing to send back
  res.status(204).send();
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
