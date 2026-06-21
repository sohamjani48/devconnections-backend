const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");
const { validateSignupData } = require("../utils/validation");

const authRouter = express.Router();

const USER_DATA_STRING =
  "email firstName lastName photoUrl age about skills password";

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req); //validation for user data

    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      photoUrl,
      about,
      skills,
    } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      age,
      gender,
      photoUrl,
      about,
      skills,
    }); //creating new instance of User model
    const createdUser = await user.save(); //this will save user in the collection
    const token = await createdUser.getJWT();
    res.cookie("token", token, { expires: new Date(Date.now() + 1 * 3600000) });
    res.json({ message: "User created successfully!", user: createdUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email)) throw new Error("Please enter valid email.");

    // const user = await User.findOne({ email: email });
    const user = await User.findOne({ email }).select(USER_DATA_STRING);

    if (!user) return res.status(404).json({ message: "Invalid credentials!" });

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials!" });

    const token = await user.getJWT();
    // _id is the data we are hiding and second param is the secret key which only server knows

    res.cookie("token", token, { expires: new Date(Date.now() + 1 * 3600000) }); // will remove cookie in 1 hr
    user.password = undefined;
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: `Error in login: ${err.message}` });
  }
});

authRouter.post("/logout", async (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({ message: "User successfully logged out!" });
});

module.exports = authRouter;
