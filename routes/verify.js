const jwt = require("jsonwebtoken");

const config = process.env;

const verify = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["access-token"];

  if (!token) {
    res.status(404).json({ error: "Authentication token not found" });
    return;
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verify;