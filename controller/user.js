const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.TOKEN_SECRET;
const userModel = require("../model/user");
// const Joi = require("joi");

exports.userSignup = async (req, res) => {
    try {
        // console.log("This is signup function");
        const { email, password } = req.body;
        const emailExist = await userModel.findOne({ email: email });
        if (emailExist) {
            res.status(409).json({ message: "Email Address Already Exists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // try {

        const saveUser = await userModel.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: email,
            password: hashedPassword,
            roleName: req.body.roleName
        })
        

        //Sending jwt token
        const token = jwt.sign({ email: saveUser.email, id: saveUser._id }, SECRET_KEY);
        res.status(201).json({ user: saveUser, token: token });

        // res.status(200).json({ message: "Admin SignUp is Completed", data: saveUser });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Here is Internal Server Error" });
    }
};

exports.userSignin = async (req, res) => {
    const {email,password} = req.body;
    const validUser = await userModel.findOne({ email: email });

    if (!validUser) {
        res.status(404).send("Admin not found please Sign Up !");
        return;
    }

    const validatePassword = await bcrypt.compare(
        password,
        validUser.password
    )

    if (!validatePassword) {
        res.status(403).send("Incorrect password Please Enter Valid Password !");
    }

    try {
        // JWT Token
        const token = jwt.sign({email : validUser.email, id :validUser._id }, SECRET_KEY);
        res.status(200).json({ user:validUser, token: token });

    } catch (error) {
        res.status(500).send(error);
    }
};