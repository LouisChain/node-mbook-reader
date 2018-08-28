const express = require("express");
const router = express.Router();

const Controller = require("../controllers/store");

router.get("/", Controller.retrieveStore);

module.exports = router;