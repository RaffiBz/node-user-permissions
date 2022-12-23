const express = require("express");

const usersController = require("../controllers/users-controllers");
const auth = require("../middleware/auth");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.post("/login", usersController.login);

router.post(
  "/user",
  fileUpload.single("image"),
  auth.auth,
  auth.allowed(1, 3),
  usersController.createUser
);

router.get("/admins", auth.auth, auth.allowed(1), usersController.getAdmins);

router.get("/users", auth.auth, auth.allowed(1, 3), usersController.getUsers);

router.get(
  "/users/me",
  auth.auth,
  auth.allowed(1, 3, 5),
  usersController.getProfile
);

router.get(
  "/users/:id",
  auth.auth,
  auth.allowed(1, 3),
  usersController.getUserById
);

router.patch(
  "/users/:id",
  auth.auth,
  auth.allowed(1, 3),
  usersController.updateUser
);

router.delete(
  "/users/:id",
  auth.auth,
  auth.allowed(1, 3),
  usersController.deleteUser
);

module.exports = router;
