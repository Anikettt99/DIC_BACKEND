const User = require("../models/User_request");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Data_set = require("../models/Data_Set");
const jwt = require("jsonwebtoken");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const HttpError = require("../models/http-error");

const History_req = require("../models/History");
const mongoose = require("mongoose");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SEND_GRID_KEY,
    },
  })
);

const getAllDataSet = async (req, res, next) => {
  let all_data_set;

  try {
    all_data_set = await Data_set.find();
  } catch (err) {
    const error = new HttpError("Account Creation Failed", 500);
    return next(error);
  }

  res.status(201).json({
    data_sets: all_data_set,
  });
};

const getDataSet = async (req, res, next) => {
  let data_set;
  console.log("HN IDAHR AA RHA");
  console.log(req.params.dataId);
  try {
    data_set = await Data_set.findById(req.params.dataId).populate("Owner");
  } catch (err) {
    const error = new HttpError("Account Creation Failed", 500);
    return next(error);
  }
  // console.log(data_set);
  res.status(201).json({ data_set: data_set });
};

const createAccount = async (req, res, next) => {
  let decodedToken = jwt.verify(req.params.token, "hlo_there");
  let email = decodedToken.userEmail;
  let data_id = decodedToken.dataId;

  /*  console.log(email);
      console.log(data_id);*/

  let user_history;
  try {
    user_history = await History_req.findById(decodedToken.userId);
  } catch (e) {
    const error = new HttpError("Account Creation Failed", 500);
    return next(error);
  }

  if (!user_history) {
    res.send("NO DATA FOUND CAN'T PROCEED");
  }

  const random_password = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 15);
  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(random_password, 12);
  } catch (err) {
    const error = new HttpError("Account Creation Failed", 500);
    return next(error);
  }

  let requested_data;
  try {
    requested_data = await Data_set.findById(data_id);
  } catch (err) {
    const error = new HttpError("Unknown Error", 500);
    return next(error);
  }

  let user = new User({
    userName: email,
    passwordHash: hashedPassword,
    requested_data_set: data_id,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    user = await user.save({ session: sess });
    user_history.request = "APPROVED";
    await user_history.save({ session: sess });
    requested_data.Count = requested_data.Count + 1;
    await requested_data.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Account Creation Failed", 500);
    return next(error);
  }

  /*try {
      user = await user.save();
    } catch (err) {
      const error = new HttpError("Account Creation Failed", 500);
      return next(error);
    }*/

  transporter.sendMail({
    to: email,
    from: "aniketsinha99123490@gmail.com",
    subject: "APPROVED",
    html: `<h1>YOUR REQUEST HAS BEEN ACCEPTED </h1>
           <h2> UserName:${user.id}</h2>
           <h2>Password:${random_password}</h2>
           <h1>CLICK THE BELOW BUTTON TO LOGIN</h1>
           <a href="http://localhost:3000/data_set/login">LOGIN<a>
           `,
  });
  res.send("CONFIRMATION SUCCEDED");
};

const requestData = async (req, res, next) => {
  console.log("AA RHI HAI REQUEST: REQUEST DATA MAI");
  /* console.log(req.body.firstName);
  if (req.body.firstName) {
    console.log("UNDEFINED HAI");
  }*/
  const {
    firstName,
    lastName,
    email,
    phoneNo,
    requestedDataSet,
    affiliation,
    position,
    websiteLink,
    courseEnrolled,
    collegeName,
    universityName,
    mentorName,
    mentorAffiliation,
    mentorUniversity,
    mentorWebsiteLink,
    titleOfWork,
    abstract,
  } = req.body;
  console.log(requestedDataSet);
  if (
    !firstName ||
    !email ||
    !phoneNo ||
    !requestedDataSet ||
    !abstract ||
    !titleOfWork
  ) {
    const error = new HttpError("Please Input All Field", 500);
    return next(error);
  }

  if (affiliation && position && websiteLink) {
  } else if (
    courseEnrolled &&
    universityName &&
    mentorName &&
    mentorAffiliation &&
    mentorUniversity &&
    mentorWebsiteLink
  ) {
  } else {
    const error = new HttpError("Please Fill Form Properly", 500);
    return next(error);
  }

  if (
    (affiliation || position || websiteLink) &&
    (courseEnrolled ||
      universityName ||
      collegeName ||
      mentorName ||
      mentorAffiliation ||
      mentorUniversity ||
      mentorWebsiteLink)
  ) {
    const error = new HttpError("Please Fill Form Correctly", 500);
    return next(error);
  }

  //return res.send("wait");

  let data_set;

  try {
    data_set = await Data_set.findById(requestedDataSet);
  } catch (err) {
    const error = new HttpError("Findning Data Set failed", 500);
    return next(error);
  }

  if (!data_set) {
    const error = new HttpError("NO DATA SET FOUND", 500);
    return next(error);
  }

  // console.log(req.body);

  let historyy;
  historyy = new History_req({
    firstName,
    lastName,
    email,
    phoneNo,
    requestedDataSet,
    affiliation,
    position,
    websiteLink,
    courseEnrolled,
    collegeName,
    universityName,
    mentorName,
    mentorAffiliation,
    mentorUniversity,
    mentorWebsiteLink,
    titleOfWork,
    abstract,
  });

  try {
    historyy = await historyy.save();
  } catch (err) {
    // console.log(err);
    const error = new HttpError(
      "Requesting Data Set Failed...Try Again Later",
      401
    );
    return next(error);
  }

  const token = jwt.sign(
    {
      userId: historyy.id,
      userEmail: email,
      dataId: requestedDataSet,
    },
    "hlo_there",
    {
      expiresIn: "1w",
    }
  );

  transporter.sendMail({
    to: email, // for verifying the request
    from: "aniketsinha99123490@gmail.com",
    subject: "REQUESTING DATA SET",
    html: `<ul>
     <li>REQUESTED DATA SET: ${data_set.Data_name}</li>
     <li>FIRST NAME:${firstName}</li>
     <li>LAST NAME:${lastName ? lastName : ""}</li>
     <li>EMAIL:${email}</li>
     <li>PHONE NO:${phoneNo}</li>
     <li><a href="http://localhost:5000/auth_request/confirm_request/${token}">CONFIRM</a></li>
     <li><a href="http://localhost:5000/auth_request/not_confirm_request/${token}">NOT CONFIRM</a></li>
    </ul>`,
  });

  res.status(201).json({
    message: "PLEASE CONFIRM YOUR REQUEST IN MAIL",
  });
};

const login = async (req, res, next) => {
  //console.log("IDHAR BHI AA RHI HAI REQUEST");
  const { userName, password } = req.body;
  if (!userName || !password) {
    const error = new HttpError("Invalid Inputs", 401);
    return next(error);
  }
  let user;
  try {
    user = await User.findById(userName);
  } catch (err) {
    const error = new HttpError("Fetching Account failed", 401);
    return next(error);
  }
  if (!user) {
    const error = new HttpError("WRONG CREDENTIAL", 401);
    return next(error);
  }
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    const error = new HttpError("WRONG CREDENTIAL", 401);
    return next(error);
  }

  let data_set;

  try {
    data_set = await Data_set.findById(user.requested_data_set);
  } catch (err) {
    const error = new HttpError("Finding Data Set Failed", 500);
    return next(error);
  }

  if (!data_set) {
    return res.status(404).send("No Data Set Found");
  }

  res.json({ userId: userName });

  console.log("Deleted Successfully");
};

const disApprove = async (req, res, next) => {
  let decodedToken = jwt.verify(req.params.token, "hlo_there");
  let email = decodedToken.userEmail;
  //let data_id = decodedToken.uid;

  let user_history;
  try {
    user_history = await History_req.findById(decodedToken.userId);
  } catch (e) {
    const error = new HttpError("Account Creation Failed", 500);
    return next(error);
  }

  user_history.request = "NOT APPROVED";
  try {
    await user_history.save();
  } catch (err) {
    const error = new HttpError("UnKnown Error", 500);
    return next(error);
  }
  transporter.sendMail({
    to: email,
    from: "aniketsinha99123490@gmail.com",
    subject: "NOT APPROVED",
    html: `<h1>YOUR REQUEST HAS BEEN NOT ACCEPTED </h1>`,
  });
  res.send("THANK YOU");
};

const dataSetConfirmedByClient = async (req, res, next) => {
  let decodedToken = jwt.verify(req.params.token, "hlo_there");
  let historyId = decodedToken.userId;
  let userEmail = decodedToken.userEmail;
  let dataId = decodedToken.dataId;

  /*console.log(dataId);
  console.log(userEmail);
  console.log(historyId);*/

  let History;
  try {
    History = await History_req.findById(historyId);
  } catch (err) {
    const error = new HttpError("UNKNOWN ERROR", 500);
    return next(error);
  }
  if (!History) {
    const error = new HttpError("NO DATA FOUND", 404);
    return next(error);
  }
  let Requested_data_set;
  try {
    Requested_data_set = await Data_set.findById(dataId);
  } catch (err) {
    const error = new HttpError("UNKNOWN ERROR", 500);
    return next(error);
  }
  if (!Requested_data_set) {
    /* const error = new HttpError("NO DATA SET FOUND", 500);
    return next(error);*/
    res.send("NO DATA SET FOUND SORRY");
  }

  try {
    History.emailVerify = true;
    await History.save();
  } catch (err) {
    const error = new HttpError("UNKNOWN ERROR", 500);
    return next(error);
  }

  const token = jwt.sign(
    {
      userId: historyId,
      userEmail: userEmail,
      dataId: dataId,
    },
    "hlo_there",
    {
      expiresIn: "1w",
    }
  );
  console.log(Requested_data_set.Email);
  if (History.affiliation) {
    transporter.sendMail({
      to: Requested_data_set.Email, // to the owner
      from: "aniketsinha99123490@gmail.com",
      subject: "REQUESTING DATA SET",
      html: `
      <h2>REQUEST FROM FACULTY/RESEARCHER</h2>
      <ul>
      <li>FIRST NAME: ${History.firstName}</li>
      <li>LAST NAME: ${History.lastName}</li>
      <li>EMAIL: ${History.email}</li>
      <li>PHONE NO: ${History.phoneNo}</li>
      <li>TITLE OF WORK: ${History.titleOfWork}</li>
      <li>ABSTRACT: ${History.abstract}</li>
      <li>AFFILIATON: ${History.affiliation}</li>
      <li>POSITION: ${History.position}</li>
      <li><a href=${History.websiteLink}>WEBSITE LINK</a></li>
      <h1>Click the link to Approve the access </h1> <a href="http://localhost:5000/auth_request/create_account/${token}">APPROVE</a> <br>
      <h1>Click the link to DisApprove the access </h1> <a href="http://localhost:5000/auth_request/not_approved/${token}">NOT APPROVE</a>  
      </ul>
      `,
    });
  } else {

    transporter.sendMail({
      to: Requested_data_set.Email, // to the owner
      from: "aniketsinha99123490@gmail.com",
      subject: "REQUESTING DATA SET",
      html: `
      <h2>REQUEST FROM STUDENT</h2>
      <ul>
      <li>FIRST NAME: ${History.firstName}</li>
      <li>LAST NAME: ${History.lastName}</li>
      <li>EMAIL: ${History.email}</li>
      <li>PHONE NO: ${History.phoneNo}</li>
      <li>TITLE OF WORK: ${History.titleOfWork}</li>
      <li>ABSTRACT: ${History.abstract}</li>
      <li>COURSE ENROLLED: ${History.courseEnrolled}</li>
      <li>COLLEGE NAME: ${History.collegeName}</li>
      <li>UNIVERSITY NAME: ${History.universityName}</li>
      <li>MENTOR NAME: ${History.mentorName}</li>
      <li>MENTOR AFFILIATION: ${History.mentorAffiliation}</li>
      <li>MENTOR UNIVERSITY: ${History.mentorUniversity}</li>
      <li><a href=${History.mentorWebsiteLink}>MENTOR WEBSITE LINK</a></li>
      <h1>Click the link to Approve the access </h1> <a href="http://localhost:5000/auth_request/create_account/${token}">APPROVE</a> <br>
      <h1>Click the link to DisApprove the access </h1> <a href="http://localhost:5000/auth_request/not_approved/${token}">NOT APPROVE</a>  
      </ul>
      `,
    });

  }

  res.send("YOUR REQUEST HAS BEEN FORWARDED...CHECK YOUR MAIL LATER");
};

const dataSetNotConfirmedByClient = async (req, res, next) => {
  console.log("AA RHI HAI REQUEST: dataSetNotConfirmedByClient");
  let decodedToken = jwt.verify(req.params.token, "hlo_there");
  let historyId = decodedToken.userId;
  try {
    await History_req.findByIdAndRemove(historyId);
  } catch (err) {
    res.send("UNKNOWN ERROR PLEASE TRY AGAIN LATER");
  }

  res.send("THANK YOU ..VISIT AGAIN");
};

const fetch_download_link = async (req, res, next) => {
  // console.log("AANE")
  const { UserId } = req.body;

  console.log(UserId);

  if (!UserId) {
    const error = new HttpError("Invalid Data Set", 401);
    return next(error);
  }

  let user;

  try {
    user = await User.findById(UserId);
  } catch (err) {
    const error = new HttpError("NO USER FOUND", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("NO USER FOUND", 404);
    return next(error);
  }

  let fetched_data_set;

  try {
    fetched_data_set = await Data_set.findById(user.requested_data_set);
  } catch (err) {
    const error = new HttpError("NO USER FOUND", 404);
    return next(error);
  }

  if (!fetched_data_set) {
    const error = new HttpError("DATA SET NOT FOUND", 404);
    return next(error);
  }

  res.json({ data_set: fetched_data_set });
};

const deleteUser = async (req, res, next) => {
  const { userId } = req.body;
  const delete_user = await User.findByIdAndRemove(userId);
  console.log("USER DELETED");
  res.json({ message: "THANK YOU FOR DOWNLOADING" });
};

exports.createAccount = createAccount;
exports.requestData = requestData;
exports.login = login;
exports.disApprove = disApprove;
exports.getAllDataSet = getAllDataSet;
exports.getDataSet = getDataSet;
exports.dataSetConfirmedByClient = dataSetConfirmedByClient;
exports.dataSetNotConfirmedByClient = dataSetNotConfirmedByClient;
exports.fetch_download_link = fetch_download_link;
exports.deleteUser = deleteUser;
