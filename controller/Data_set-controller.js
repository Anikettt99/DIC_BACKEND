const Data_set = require("../models/Data_Set");
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
const User = require("../models/User_upload");
const mongoose = require("mongoose");

const uploadData = async (req, res, next) => {
  /* console.log(req.body);
  return res.send("WAIT");*/

  const {
    Name,
    Data_name,
    Description,
    PaperName,
    Introduction_Date,
    DataSet_Licence,
    Url_To_Full_Licence,
    Modalities,
    Languages,
    Tasks,
    downloadLink,
    sampleDataSet,
  } = req.body;

  //console.log(req.body)

  if (
    !Name ||
    !Data_name ||
    !Description ||
    !PaperName ||
    !Introduction_Date ||
    !DataSet_Licence ||
    !Url_To_Full_Licence ||
    !Modalities ||
    !Languages ||
    !Tasks ||
    !downloadLink ||
    !sampleDataSet
  ) {
    const error = new HttpError("PLEASE FILL ALL FIELD", 401);
    return next(error);
  }

  const authHeader = req.get("Authorization");
  const secret = "hlo_there";
  //console.log(authHeader);
  if (!authHeader) {
    const error = new HttpError("Not Authenticated", 401);
    return next(error);
  }

  let decodedToken;
  try {
    const token = authHeader.split(" ")[1];
    decodedToken = jwt.verify(token, secret);
  } catch (err) {
    const error = new HttpError("WRONG TOKEN", 401);
    return next(error);
  }
  req.userId = decodedToken.userId;
  req.email = decodedToken.email;

  /* console.log(req.userId);
  console.log(req.email);

  const error = new HttpError("Not Authenticated", 401);
  return next(error);*/

  let data_set;

  data_set = new Data_set({
    Name,
    FullName: req.body.FullName ? req.body.FullName : "",
    Owner: req.userId,
    Email: req.email,
    Data_name,
    HomePage_Url: req.body.HomePage_Url ? req.body.HomePage_Url : "",
    Description,
    PaperName,
    Introduction_Date,
    DataSet_Licence,
    Url_To_Full_Licence,
    Modalities,
    Languages,
    Tasks,
    downloadLink,
    sampleDataSet,
  });

  let owner;
  try {
    owner = await User.findById(req.userId);
  } catch (err) {
    const error = new HttpError("UNKNOWN ERROR", 500);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await data_set.save({ session: sess });
    owner.data_sets.push(data_set);
    await owner.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("UPLOADING DATA FAILED", 500);
    return next(error);
  }

  res.status(201).json({
    message: "DATA UPLOADED SUCCESSFULLY",
  });
};

const search_data_set = async (req, res, next) => {
  router.post("/search-users", (req, res) => {
    let userPattern = new RegExp("^" + req.body.query);
    User.find({ email: { $regex: userPattern } })
      .select("_id email")
      .then((user) => {
        res.json({ user });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.uploadData = uploadData;
exports.search_data_set = search_data_set;
