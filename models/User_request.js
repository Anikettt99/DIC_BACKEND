const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  requested_data_set: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "DataSet",
  },
});

module.exports = mongoose.model("User_request", userSchema);
