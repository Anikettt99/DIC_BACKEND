const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

function authJwt() {
  console.log("authJwt() function mai")
  // const secret = process.env.SECRET_JWT;
  return expressJwt({
    secret: "hlo_there",
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      "/auth_request/request_data"
    ]
  })
}

async function isRevoked(req, payload, done) {
  console.log("hlo from jwt isRevoked")
  const authHeader = req.get("Authorization");
  const secret = "hlo_there";
  if (!authHeader) {
    const error = new HttpError("Not Authenticated", 401);
    return next(error);
  }

  const token = authHeader.split(" ")[1];
  let decodedToken = jwt.verify(token, secret);
  req.userId = decodedToken.userId;
  req.email = decodedToken.email;

  done();
}

module.exports = authJwt;
