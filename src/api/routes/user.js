const express = require("express");
const router = express.Router();

const Controller = require("../controllers/user");

router.post("/signup", Controller.signup);

router.post("/fbLogin", Controller.fbLogin);

router.post("/token", Controller.refreshToken);

router.post("/login", Controller.login);

// router.delete("/:id", Controller.deleteUser);

module.exports = router;