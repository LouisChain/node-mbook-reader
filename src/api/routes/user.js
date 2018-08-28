const express = require("express");
const router = express.Router();

const Controller = require("../controllers/user");

router.post("/signup", Controller.signup);

router.post("/login", Controller.login);

router.delete("/:id", Controller.deleteUser);

module.exports = router;