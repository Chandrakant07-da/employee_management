const express = require("express");
const cors = require("cors");
const userController = require("../controller/user");

const verify = require("./verify");

const router = express.Router();

router.post('/signup', cors(), userController.adminSignup);
router.post('/signin', cors(), verify, userController.adminSignin);

module.exports = router;