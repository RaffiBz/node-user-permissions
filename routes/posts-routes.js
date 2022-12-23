const express = require("express");

const postController = require("../controllers/posts-controllers");
const auth = require("../middleware/auth");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.post(
  "/post",
  fileUpload.single("image"),
  auth.auth,
  auth.allowed(1, 3, 5),
  postController.createPost
);

router.patch(
  "/post/:id",
  auth.auth,
  auth.allowed(1, 3),
  postController.updatePostStatus
);

router.get(
  "/post/:id",
  auth.auth,
  auth.allowed(1, 3, 5),
  postController.getPostById
);

router.get("/posts", auth.auth, auth.allowed(1, 3, 5), postController.getPosts);

router.delete(
  "/post/:id",
  auth.auth,
  auth.allowed(1, 3, 5),
  postController.deletePost
);

module.exports = router;
