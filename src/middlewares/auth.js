const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) res.status(401).json({ message: "Token Invalid!" });

    const decodedMessage = await jwt.verify(token, "ThisIsSoham");
    const { _id } = decodedMessage;

    const user = await User.findById(_id);
    if (!user) res.status(404).json({ message: "User not Found!" });

    req.user = user; //attached the user on request object
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
};

module.exports = { userAuth };
