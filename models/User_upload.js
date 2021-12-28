const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const user_upload = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "NOT VERIFIED",
  },
  data_sets: [
    {
      type: mongoose.Types.ObjectId,
      ref: "DataSet",
    },
  ],
});

module.exports = mongoose.model("User_upload", user_upload);
