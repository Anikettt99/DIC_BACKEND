const User = require("../models/User_upload");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SEND_GRID_KEY,
    },
  })
);

const createAccount = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    const error = new HttpError("Please Input All Field", 500);
    return next(error);
  }

  let user_existing;
  try {
    user_existing = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Unknown Error", 500);
    return next(error);
  }

  if (user_existing) {
    const error = new HttpError("User with this email Id already Exists", 500);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Account Creation Failed", 500);
    return next(error);
  }

  let createdUser = new User({
    name: name,
    email: email,
    password: hashedPassword,
  });

  try {
    createdUser = await createdUser.save();
  } catch (e) {
    const error = new HttpError("UNKNOWN ERROR", 500);
    return next(error);
  }

  const token = jwt.sign(
    {
      userId: createdUser.id,
    },
    "hlo_there"
  );

  transporter.sendMail({
    to: email,
    from: "aniketsinha99123490@gmail.com",
    subject: "VERIFY YOUR ACCOUNT",
    html: `<h1>Click the link to Verify your account </h1> <a href="http://localhost:5000/auth_upload/verify_account/${token}">VERIFY</a>`,
  });

  res.status(201).json({
    message: "VERIFICATION LINK HAS BEEN SEND TO YOUR MAIL",
  });
};

const verifyAccount = async (req, res, next) => {
  let decodedToken = jwt.verify(req.params.token, "hlo_there");

  let userId = decodedToken.userId;

  let User_found;

  try {
    User_found = await User.findById(userId);
  } catch (e) {
    const error = new HttpError("UnKnown Error", 500);
    return next(error);
  }
  if (!User_found) {
    const error = new HttpError("UnKnown Error", 500);
    return next(error);
  }
  User_found.status = "VERIFIED";

  try {
    await User_found.save();
  } catch (err) {
    const error = new HttpError("UNKNOWN ERROR", 500);
    return next(error);
  }

  res.send("VERIFICATION SUCCESSFULL NOW YOU CAN LOGIN");
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new HttpError("PLEASE FILL ALL THE FIELDS", 401);
    return next(error);
  }
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("UNKNOWN ERROR", 401);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("NO USER FOUND", 401);
    return next(error);
  }

  //console.log(user);

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    console.log(err);
    const error = new HttpError("Could Not Login Please try again", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("CHECK YOUR CREDENTIAL", 401);
    return next(error);
  }

  if (user.status !== "VERIFIED") {
    const error = new HttpError("PLEASE VERIFY YOUR ACCOUNT", 401);
    return next(error);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    "hlo_there"
  );
  res.status(201).json({
    user: user,
    token: token,
  });
};

exports.createAccount = createAccount;
exports.verifyAccount = verifyAccount;
exports.login = login;
