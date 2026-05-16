const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

const USER_DATA_STRING = "firstName lastName photoUrl age about skills gender";

const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const receivedRequests = await ConnectionRequest.find({
      toUserId: user._id,
      status: "pending",
    }).populate("fromUserId", USER_DATA_STRING);
    // .populate("fromUserId", ["firstName", "lastName", "photoUrl", "age", "about", "skills"]);

    if (!receivedRequests?.length) {
      return res
        .status(404)
        .json({ message: "No new connection requests available!" });
    }
    res.json({
      data: receivedRequests,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error fetching requests" + err.message,
    });
  }
});

userRouter.get("/user/requests/connections", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        {
          toUserId: user._id,
          status: "accepted",
        },
        {
          fromUserId: user._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", USER_DATA_STRING)
      .populate("toUserId", USER_DATA_STRING);

    if (!connections?.length)
      return res.status(404).json({ message: "No connections found!" });

    const data = connections.map((connection) => {
      if (connection?.toUserId?._id.toString() === user._id.toString())
        return connection.fromUserId;
      return connection.toUserId;
    });

    res.json({
      data,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error fetching connections" + err.message,
    });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const page = req.query?.page ? parseInt(req.query.page) : 1;
    let limit = req.query?.limit ? parseInt(req.query.limit) : 10;
    limit = limit > 50 ? 50 : limit;

    console.log("logxx limit is", req.query?.limit, limit);
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: user._id }, { toUserId: user._id }],
    }).select("fromUserId toUserId");

    const hideUserIds = new Set();

    connectionRequests.forEach((connection) => {
      hideUserIds.add(connection.fromUserId.toString());
      hideUserIds.add(connection.toUserId.toString());
    });

    const feedUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserIds) } },
        { _id: { $ne: user._id } },
      ],
    })
      .select(USER_DATA_STRING)
      .skip((page - 1) * limit)
      .limit(limit);

    if (!feedUsers?.length)
      return res.status(404).json({ message: "No new suggestions right now!" });

    res.json({ data: feedUsers });
  } catch (err) {
    res.status().json({
      message: err.message,
    });
  }
});

module.exports = userRouter;
