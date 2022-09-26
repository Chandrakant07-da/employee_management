const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.TOKEN_SECRET;
const userModel = require("../model/user");
const signupSchema= require("../model/user");

exports.adminSignup = async (req, res) => {
    const emailExist = await userModel.findOne({ email: req.body.email });

    if (emailExist) {
        res.status(409).send("This Email is already exist..!");
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    try {

        const { error } = await signupSchema.validateAsync(req.body);
        if (error) {
            res.send(error.details[0].message);
        } else {
            const user = new userModel({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hashedPassword.req.body.password
            })

            const saveAdmin = await user.save();

            //Setting jwt token
            const token = jwt.sign({email : saveAdmin.email, id : saveAdmin._id }, SECRET_KEY);
            res.status(201).json({user: saveAdmin, token: token});

            res.status(200).send("Admin SignUp is Completed");
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.adminSignin = async(req, res)=> {
    const admin = await userModel.findOne({email: req.body.email});

    if(!admin){
        res.status(404).send("Admin not found please Sign Up !");
        return;
    }

    const validatePassword = await bcrypt.compare(
        req.body.password,
        user.password
    )

    if(!validatePassword){
        res.status(403).send("Incorrect password Please Enter Valid Password !");
    }

    try{
        // JWT Token
        // const token = jwt.sign({email : admin.email, id : admin._id }, SECRET_KEY);
        res.status(200).json({user: admin, token: token});

    }catch(error){
        res.status(500).send(error);
    }
};