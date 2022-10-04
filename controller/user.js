const bcrypt = require("bcryptjs");
const { number } = require("joi");
const jwt = require("jsonwebtoken");
const roleModel = require("../model/roles");
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
            role_id: req.body.role_id
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
                        localField: "role_id",
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
            role_id: req.body.role_id
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
                role_id: req.body.role_id
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
};

exports.search = async (req, res) => {
    const key = req.params.key;
    //checking result in roles collection
    const role = await roleModel.findOne({ 'title': { $regex: key, $options: 'i' } });
    if (!role) {
        if (key.match(/^[a-zA-Z ]{2,30}$/)) {
            const data = await userModel.find(
                {
                    "$or": [
                        { "firstName": { $regex: key, $options: 'i' } },
                        { "lastName": { $regex: key, $options: 'i' } }
                    ]
                }
            );
            res.status(201).send(data);
            return;
        } else if (key.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)) {
            const data = await userModel.find(
                {
                    "$or": [
                        { "email": { $regex: key, $options: 'i' } },
                    ]
                }
            );
            res.status(201).send(data);
            return;
        }
    } else {
        const newkey =role.role_id;
        //storing the result id to a varable named condition for searching it to user collection
        const data = await userModel.find(
            {
                "role_id":newkey
            }
        );
        res.status(201).send(data);
        return;
    }
}
