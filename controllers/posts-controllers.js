const fs = require("fs");

const HttpError = require("../models/http-error");
const Post = require("../models/post");

exports.createPost = async (req, res, next) => {
  try {
    const post = new Post({
      text: req.body.text,
      image: req.file.path,
      owner: req.user._id,
      status: "pending",
    });

    await post.save();
    res.status(201).json({
      message: "Post created waiting to be approved",
      post,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Invalid data, could not create post", 500));
  }
};

exports.updatePostStatus = async (req, res, next) => {
  const status = req.query.status;
  if (!status) {
    return next(new HttpError("Invalid data, please provide status", 500));
  }

  try {
    const post = await Post.findById({ _id: req.params.id });
    if (!post) {
      return next(new HttpError("Post does not exist", 404));
    }
    post.status = status;
    await post.save();
    res.status(200).json({ message: `Post ${status}`, post });
  } catch (error) {
    return next(
      new HttpError("Something went wrong could not fetch post", 500)
    );
  }
};

exports.getPosts = async (req, res, next) => {
  const status = req.query.status || "approved";

  if (req.user.roleId === 5 && status === "rejected") {
    return next(new HttpError("Could not fetch posts with this status", 500));
  }

  try {
    const posts = await Post.find({ status });
    res.status(200).json({ count: posts.length, posts });
  } catch (error) {
    new HttpError("Something went wrong could not fetch posts", 500);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    if (!post) {
      return next(new HttpError("Post does not exist", 404));
    }
    if (req.user.role === "user" && post.status === "rejected") {
      return next(new HttpError("You can not see this post", 403));
    }
    res.status(200).json({ post });
  } catch (error) {
    new HttpError("Something went wrong could not fetch post", 500);
  }
};

exports.deletePost = async (req, res, next) => {
  let post;
  try {
    post = await Post.findById({ _id: req.params.id });
    if (!post) {
      return next(new HttpError("No post found", 404));
    }
    if (
      req.user.roleId === 5 &&
      req.user._id.toString() !== post.owner.toString()
    ) {
      return next(new HttpError("You cannot delete this post", 403));
    }
    await post.remove();
    res.status(200).json({ message: "Post deleted", post: post.text });
  } catch (error) {
    new HttpError("Something went wrong could not delete post", 500);
  }

  fs.unlink(post.image, (err) => {
    console.log(err);
  });
};
