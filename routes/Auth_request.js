const express = require("express");

const router = express.Router();

const authController = require("../controller/auth_request-controller");

router.get("/get_all_data_set", authController.getAllDataSet);

router.get("/get_data_set/:dataId", authController.getDataSet);

router.get("/create_account/:token", authController.createAccount);

router.post("/request_data", authController.requestData);

router.post("/login", authController.login);

router.get("/not_approved/:token", authController.disApprove);

router.get("/confirm_request/:token", authController.dataSetConfirmedByClient);

router.get(
  "/not_confirm_request/:token",
  authController.dataSetNotConfirmedByClient
);

router.post("/data_set/download", authController.fetch_download_link);

router.post("/delete_user", authController.deleteUser);

module.exports = router;
