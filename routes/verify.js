const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(404).json({ error: "Authentication token not found" });
    return;
  }
  try {
    const authentication = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = authentication;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthenticated" });
  }
};