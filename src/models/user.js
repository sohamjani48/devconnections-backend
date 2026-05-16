const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: 3, maxLength: 50 },
    lastName: { type: String, minLength: 3, maxLength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxLength: 50,
      validate: (value) => {
        if (!validator.isEmail(value))
          throw new Error("Invalid Email Address!");
      },
    },
    password: {
      type: String,
      required: true,
      maxLength: 100,
      validate: (value) => {
        if (!validator.isStrongPassword(value))
          throw new Error("Please enter a strong password!");
      },
    },
    age: { type: Number, min: 18, max: 69 },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: `{VALUE} is not supported in gender`,
      },
      // validate: (val) => {
      //   if (!["male", "female", "others"].includes(val.toLowerCase())) {
      //     throw new Error("Gender data is not valid!");
      //   }
      // },
    },
    photoUrl: {
      type: String,
      default: function () {
        if (this.gender === "Male")
          return "https://www.istockphoto.com/photos/professional-profile-photo";
        if (this.gender === "Female")
          return "https://cultivatedculture.com/linkedin-profile-picture/";
        return "https://support.hubstaff.com/profile-pictures-for-hubstaff-talent/";
      },
      validate: (value) => {
        if (!validator.isURL(value)) throw new Error("Invalid Profile URL!");
      },
    },
    about: {
      type: String,
      default: "Hi! I am new on this app.",
      maxLength: 200,
    },
    skills: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 5; // Max of 5 skills allowed
        },
        message: "You cannot have more than 5 skills.",
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  // when we create an instance of a model, this will represent that particular instance for which it is calling
  // this keyword work like this in function only, in arrow function it works differently/
  const user = this;

  const token = await jwt.sign({ _id: user._id }, "ThisIsSoham", {
    expiresIn: "1h", //this will expire in 1 hour
  });
  return token;
};

userSchema.methods.validatePassword = async function (inputPasswordByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    inputPasswordByUser,
    passwordHash
  );

  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
