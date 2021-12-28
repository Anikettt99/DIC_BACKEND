const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const tympass = require("./helpers/tympass");

const app = express();
const upload = multer();

const Data_setRouter = require("./routes/Data_set");
const User_request = require("./routes/Auth_request");
const User_upload = require("./routes/Auth_upload");

app.use(cors());
app.use(upload.array());
app.options("*", cors());

app.use(bodyParser.json());

app.use("/data", Data_setRouter);
app.use("/auth_request", User_request);
app.use("/auth_upload", User_upload);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
 // console.log(error);
  res.status(error.code || 500);
  res.json({ error: error.message || "An Unknown error occured" });
});

const URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.y7u3n.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Database connection is ready");
    app.listen(5000, () => {
      console.log("Listening on port 5000");
    });
  });
