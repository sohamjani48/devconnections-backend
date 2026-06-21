const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

const { connectDB } = require("./config/database");

const app = express();

app.use(
  cors({
    origin: ["http://3.84.147.101", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then((res) => {
    console.log("logxx database connected successfully");
    app.listen(1900, () => {
      console.log("logxx server started on localhost:1900 successfully");
    });
  })
  .catch((err) => {
    console.error("Database couldn't connect");
  });
