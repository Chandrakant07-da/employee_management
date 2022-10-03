const express = require("express");
const router = express.Router();
const userController = require("../controller/user");
const verify = require("./verify");
const authorization = require("./authorization");

router.post("/welcome", verify,authorization, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

router.post("/signup", userController.userSignup);
router.post("/signin", userController.userSignin);
router.get("/logout",verify, userController.logoutUser);
router.post("/adduser",verify,authorization, userController.addUser);
router.get("/getuser/:id",verify,authorization, userController.getUser);
router.delete("/delete/:id",verify,authorization, userController.deleteUser);
router.put("/update/:id",verify,authorization, userController.editUser);
router.get("/search/:key",userController.search);
module.exports = router;