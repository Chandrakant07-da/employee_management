const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.TOKEN_SECRET;
const userModel = require("../model/user");
// const Joi = require("joi");

exports.userSignup = async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailExist = await userModel.findOne({ email: email });
        if (emailExist) {
            res.status(400).json({ message: "Email Address Already Exists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const saveUser = await userModel.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: email,
            password: hashedPassword,
            role_Id: req.body.role_Id
        })
        //Sending jwt token
        const token = jwt.sign({ email: saveUser.email, id: saveUser._id }, SECRET_KEY, { expiresIn: '1d' });
        res.status(201).json({ user: saveUser, token: token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Here is Internal Server Error" });
    }
};

exports.userSignin = async (req, res) => {
    try {
        const { email, password } = req.body;
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
        userModel
            .aggregate([
                {
                    $lookup: {
                        from: "roles",
                        localField: "role_Id",
                        foreignField: "role_id",
                        as: "user_permissions",
                    },
                },
                {
                    $unwind: "$user_permissions",
                },
            ])
            .then((result) => {
                const resultUser = result.find(
                    (doc) => doc._id.toString() === validUser._id.toString()
                );
                // Build logic for all the permissions 
                const editPermission = resultUser.user_permissions.permissions.edit;
                const title = resultUser.user_permissions.title;
                try {
                    // JWT Token
                    const token = jwt.sign(
                        { email: validUser.email, _id: validUser._id, title: title, editPermission: editPermission },
                        SECRET_KEY, { expiresIn: '1d' }
                    );
                    res.status(200).json({ user: validUser, token: token });
                    // const token = jwt.sign({ email: validUser.email, id: validUser._id }, SECRET_KEY);
                    // res.cookie(`token`, token, {
                    //     expires: new Date(Date.now() + 86400000),
                    //     httpOnly: true
                    // });
                } catch (error) {
                    res.status(500).send(error);
                }

            })
    } catch (error) {
        res.status(500).send(error);
    };
};

exports.logoutUser = async (req, res) => {
    try {
        console.log(req.user);
        // res.clearCookie(`token`);
        res.status(201).send("User Logout Successfully");
        await req.user.save();
    } catch (error) {
        res.status(500).send(error)
    }
};

exports.addUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailExist = await userModel.findOne({ email: email });
        if (emailExist) {
            res.status(400).json({ message: "Email Address Already Exists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: email,
            password: hashedPassword,
            role_Id: req.body.role_Id
        })
        const saveUser = await newUser.save()
        return res
            .status(201)
            .json({ message: "New User Added Successfully", data: saveUser });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Here is Internal Server Error" });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.params.id });
        res.status(200).json({ data: user });
        return;
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.deleteUser = async (req, res) => {
    userModel.deleteOne({ _id: req.params.id }, (error) => {
        if (error) {
            res.send(error);
            return;
        } else {
            res.send("User Detail Deleted");
        }
    });
};
exports.editUser = async (req, res) => {
    try {
        userModel.updateOne(
            { _id: req.params.id },
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                role_Id: req.body.role_Id
            },
            (error) => {
                if (error) {
                    res.status(404).json({ error: "User not found" });
                    return;
                }
                res.status(201).json({ message: "User Details Updated" });
            }
        )
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    };
}
