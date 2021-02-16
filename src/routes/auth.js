const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.js");

router.get("/login", authController.getLoginPage);
router.get("/register", authController.getRegisterPage);
router.post("/login", express.urlencoded({ extended: false }), authController.postLogin);
router.post("/register", express.urlencoded({ extended: false }), authController.postRegister);

module.exports = {
  routes: router,
};