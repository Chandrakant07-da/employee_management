const userModel = require("../model/user");

const superAdmin = (userId, next, res) => {
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
      const user = result.find((doc) => doc._id.toString() === userId.toString());
        if (user && user.user_permissions.permissions.edit === true) {
          next();
          return;
        }
         return res.status(403).json({ error: "Forbidden" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal Server Error" });
    });
};
// module.exports = superAdmin;
module.exports = (req, res, next) => {
  const userId = req.user._id;
  superAdmin(userId, next, res);
};