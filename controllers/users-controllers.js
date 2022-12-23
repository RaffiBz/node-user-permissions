const HttpError = require("../models/http-error");
const User = require("../models/user");

exports.createUser = async (req, res, next) => {
  if (req.body.role == 1) {
    console.log("hey");
    return next(new HttpError("Only 1 Superadmin is allowed", 403));
  }

  if (req.body.roleId == 3 && req.user.roleId == 3) {
    return next(new HttpError("Not allowed", 403));
  }

  try {
    const user = new User({
      roleId: req.body.roleId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      image: req.file.path,
    });
    await user.save();
    res.status(201).json({
      message: "User created successfully",
      userId: user.id,
      email: user.email,
    });
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.login = async (req, res, next) => {
  let user;

  try {
    user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ userId: user.id, token });
  } catch (error) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 403)
    );
  }

  if (!user) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({ roleId: 3 }, "-password");
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find users.", 500)
    );
  }
  res.json({ users, count: users.length });
};

exports.getAdmins = async (req, res, next) => {
  let admins;
  try {
    admins = await User.find({ roleId: 3 }, "-password");
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find users.", 500)
    );
  }
  res.json({ admins, count: admins.length });
};

exports.getUserById = async (req, res, next) => {
  const userId = req.params.id;
  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find a user", 500)
    );
  }
  if (req.user.roleId === 3 && user.roleId !== 5) {
    return next(new HttpError("Not allowed", 403));
  }

  if (!user || user.deletedAt !== undefined) {
    return next(new HttpError("Not found", 404));
  }
  res.json(user);
};

exports.getProfile = async (req, res, next) => {
  let user;
  try {
    user = await User.findOne({ _id: req.user._id });
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find a user", 500)
    );
  }
  if (!user) {
    return next(new HttpError("Not found", 400));
  }
  res.status(200).json({ user });
};

exports.updateUser = async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["firstName", "lastName", "username", "roleId"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(404).send({ message: "Invalid update" });
  }
  let user;
  try {
    user = await User.findOne({ _id: req.params.id });
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find a user", 500)
    );
  }

  if (!user) {
    return next(new HttpError("Not found", 404));
  }

  if (req.user.roleId === 3 && user.roleId !== 5) {
    return next(new HttpError("Not allowed", 403));
  }

  try {
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
  } catch (error) {
    return next(new HttpError("Something went wrong", 500));
  }
  res.status(200).json({ message: "User Updated", user });
};

exports.deleteUser = async (req, res, next) => {
  let user;
  try {
    user = await User.findOne({ _id: req.params.id });
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find a user", 500)
    );
  }

  if (user.roleId == 1) {
    return next(new AppError("Cannot delete", 403));
  }

  if (req.user._id === user._id) {
    try {
      const now = new Date();
      user.deletedAt = now;
      user.tokens = [];
      await user.save();
    } catch (error) {
      return next(new HttpError("Something went wrong", 500));
    }
    return res.status(200).json({ message: "User deleted", user });
  }

  if (req.user.roleId === 5) {
    return next(new HttpError("Not authorized", 403));
  }

  if (req.user.role == 3 && user.role !== 5) {
    return next(new HttpError("Not allowed", 403));
  }

  try {
    const now = new Date();
    user.deletedAt = now;
    user.tokens = [];
    await user.save();
  } catch (error) {
    return next(new HttpError("Something went wrong", 500));
  }
  return res.status(200).json({ message: "User deleted", user });
};
