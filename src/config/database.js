const mongoose = require("mongoose");

const MONGODB_CLUSTER_URL =
  "mongodb+srv://soham:srj13579@myfirstcluster.virlawt.mongodb.net/devTestAppDB?appName=MyFirstCluster";

const connectDB = async () => {
  await mongoose.connect(MONGODB_CLUSTER_URL);
};

module.exports = {
  connectDB,
};
