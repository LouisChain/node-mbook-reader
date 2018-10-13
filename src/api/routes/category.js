const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const Controller = require("../controllers/category");

router.get("/:id", Controller.getCategory);

module.exports = router;