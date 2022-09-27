const express = require("express");
const router = express.Router();
const userController = require("../controller/user");

console.log("here in Routes");
// const verify = require("./verify");




router.post("/signup", userController.userSignup);

router.post("/signin", userController.userSignin);

module.exports = router;