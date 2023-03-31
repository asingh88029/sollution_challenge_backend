const mongoose = require("mongoose");

async function connect() {
  const connection = await mongoose.connect(process.env.MONGO_URI);
  return connection;
}

module.exports = connect;
