const jwt = require("jsonwebtoken");
const Const = require("../const");
const Exceptions = require("../utils/exception");

module.exports = (req, res, next) => {
  try {
    let token = req.headers.authorization.split(" ")[1];// Bearer xhxhxifjidjfidi >>> take second
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, Const.JWT_KEY, function (err, decoded) {
        if (err) {
          return res.status(401).json(Exceptions.unauthorized_access);
        }
        req.userData = decoded;
        next();
      });
    } else {
      return res.status(403).json(Exceptions.missing_token);
    }
  } catch (error) {
    res.status(401).json(Exceptions.unauthorized_access);
  }
}