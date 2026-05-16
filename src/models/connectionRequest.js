const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "pending", "accepted", "rejected"],
        message: `{VALUE}`,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// compound query for from and to userid
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

//validations to run before saving
connectionRequestSchema.pre("save", async function (next) {
  const connectionRequest = this;

  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Not allowed to send request to yourself!");
  }
});

const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

module.exports = ConnectionRequestModel;
