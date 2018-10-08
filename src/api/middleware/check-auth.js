const jwt = require("jsonwebtoken");
const Const = require("../const");
const Exceptions = require("../utils/exception");

module.exports = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];// Bearer xhxhxifjidjfidi >>> take second
      // verifies secret and checks exp
      jwt.verify(token, Const.TOKEN_SECRET, function (err, decoded) {
        if (err) {
          return res.status(401).json(Exceptions.invalid_signature);
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