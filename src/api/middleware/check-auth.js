const jwt = require("jsonwebtoken");
const Const = require("../const");

module.exports = (req, res, next) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    let decoded = jwt.verify(token, Const.JWT_KEY);
    req.userData = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Authoration failed"
    });
  }
}