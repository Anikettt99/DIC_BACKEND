const express = require("express");

const data_set_controller = require("../controller/Data_set-controller");

const router = express.Router();

/*router.post("/create_account", authController.createAccount);
router.get("/verify_account/:token", authController.verifyAccount);
router.post("/login", authController.login);*/

router.post("/upload_data-set", data_set_controller.uploadData);

router.post("/search_data_set" , data_set_controller.search_data_set)

module.exports = router;
