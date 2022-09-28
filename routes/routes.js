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
router.post("/adduser",verify, userController.addUser);
router.get("/getuser/:id",verify, userController.getUser);
router.delete("/delete/:id",verify, userController.deleteUser);
router.put("/update/:id",verify, userController.editUser);
module.exports = router;