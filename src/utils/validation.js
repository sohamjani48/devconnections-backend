const validator = require("validator");

const EDITABLE_PROFILE_FIELDS = [
  "lastName",
  "password",
  "age",
  "gender",
  "photoUrl",
  "about",
  "skills",
];

const validateSignupData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName)
    throw new Error("Please enter first name and last name");
  else if (!validator.isEmail(email))
    throw new Error("Please enter valid email id.");
  else if (!validator.isStrongPassword(password))
    throw new Error("Please enter a strong password.");
};

const validateProfileEditData = async (req) => {
  return Object.keys(req.body).some(
    (key) => !EDITABLE_PROFILE_FIELDS.includes(key)
  );
};

module.exports = { validateSignupData, validateProfileEditData };
