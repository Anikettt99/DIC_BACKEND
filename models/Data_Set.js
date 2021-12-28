const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DataSetSchema = new Schema({
  Name: {
    type: String,
    required: true,
  },

  FullName: {
    type: String,
    default: "",
  },

  Data_name: {
    type: String,
    required: true,
  },

  Owner: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User_upload",
  },

  Email: {
    type: String,
    required: true,
  },

  Count: {
    type: Number,
    default: 0,
  },

  Description: {
    type: String,
    required: true,
  },

  HomePage_Url: {
    type: String,
    default: "",
  },

  PaperName: {
    type: String,
    required: true,
  },
  Introduction_Date: {
    type: Date,
    required: true,
  },

  DataSet_Licence: {
    type: String,
    required: true,
  },

  Url_To_Full_Licence: {
    type: String,
    required: true,
  },

  Modalities: {
    type: String,
    required: true,
  },
  Languages: {
    type: String,
    required: true,
  },

  Tasks: {
    type: String,
    required: true,
  },

  downloadLink: {
    type: String,
    required: true,
  },
  sampleDataSet: {
    type: String,
    required: true,
  },

  Date: {
    type: Date,
    default: Date(),
  },
});

module.exports = mongoose.model("DataSet", DataSetSchema);
