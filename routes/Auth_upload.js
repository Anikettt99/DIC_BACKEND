const express = require("express");

const authController = require("../controller/auth_upload-controller");

const router = express.Router();

router.post("/create_account", authController.createAccount);
router.get("/verify_account/:token", authController.verifyAccount);
router.post("/login", authController.login);

module.exports = router;
