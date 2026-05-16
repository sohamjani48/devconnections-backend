const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/validation");

const profileRouter = express.Router();

const USER_DATA_KEYS = [
  "email",
  "firstName",
  "lastName",
  "photoUrl",
  "age",
  "about",
  "skills",
  "gender",
];

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    // userAuth middleware already attaches user on requst
    const user = req.user;
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error("Invalid Request!");
    }

    const user = req.user;
    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });

    // await User.updateOne({ _id: user._id }, user);
    const savedUser = await user.save();
    const userObj = savedUser.toObject();

    const filteredUser = USER_DATA_KEYS.reduce((acc, key) => {
      if (userObj[key] !== undefined) {
        acc[key] = userObj[key];
      }
      return acc;
    }, {});

    res.json({
      message: `${filteredUser.firstName} successfully updated`,
      user: filteredUser,
    });

    res.json({ message: `${user.firstName} User successfully updated`, data });
  } catch (err) {
    res.status(400).json({ message: err?.message ?? "Soemthing went wrong!" });
  }
});

profileRouter.patch("/profile/forgotPassword", userAuth, async (req, res) => {
  // Check if current password is correct or not
  // CHeck if new password is strong or not
  try {
    if (!validateProfileEditData(req)) {
      throw new Error("Invalid Request!");
    }

    const user = req.user;
    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });

    // await User.updateOne({ _id: user._id }, user);
    const data = await user.save();
    res.json({ message: `${user.firstName} User successfully updated`, data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = profileRouter;
