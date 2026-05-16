const express = require("express");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

const ALLOWED_SEND_STATUS_TYPES = ["ignored", "pending"];
const ALLOWED_REVIEW_STATUS_TYPES = ["accepted", "rejected"];

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      if (!ALLOWED_SEND_STATUS_TYPES.includes(status)) {
        return res
          .status(400)
          .json({ message: `Invalid status type: ${status}` });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: `User doesn't exist` });
      }

      const existingConnections = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnections) {
        return res.status(400).json({
          message: "Request already exists!",
        });
      }

      const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.json({
        message: "request successfully sent!",
        data,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const { status, requestId } = req.params;

      if (!ALLOWED_REVIEW_STATUS_TYPES.includes(status))
        return res
          .status(400)
          .json({ message: `Invalid status type: ${status}` });

      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: user._id,
        status: "pending",
      });

      if (!connectionRequest) {
        return res.status(404).json({ message: "Request doesnt't exist!" });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({ message: `Request successfully: ${status}`, data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

module.exports = requestRouter;
