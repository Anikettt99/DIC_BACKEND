const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const historySchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: Number,
      required: true,
    },
    affiliation: {
      type: String,
      default: "",
    },
    position: {
      type: String,
      default: "",
    },
    websiteLink: {
      type: String,
      default: "",
    },
    courseEnrolled: {
      type: String,
      default: "",
    },
    collegeName: {
      type: String,
      default: "",
    },
    universityName: {
      type: String,
      default: "",
    },
    mentorName: {
      type: String,
      default: "",
    },
    mentorAffiliation: {
      type: String,
      default: "",
    },

    mentorUniversity: {
      type: String,
      default: "",
    },

    mentorWebsiteLink: {
      type: String,
      default: "",
    },
    titleOfWork: {
      type: String,
      default: "",
    },

    abstract: {
      type: String,
      default: "",
    },
    request: {
      type: String,
      default: "PENDING"
    },
    requestedDataSet: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "DataSet",
    },
    emailVerify: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("History", historySchema);
