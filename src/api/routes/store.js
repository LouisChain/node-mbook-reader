const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const Controller = require("../controllers/store");

router.get("/", Controller.fetchStore);

router.get("/category", Controller.getByCategory);

router.get("/search", Controller.search);
// router.post("/", checkAuth, upload.single("file"), Controller.createBook);

// router.get("/:id", Controller.getBook);

// router.patch("/:id", checkAuth, Controller.updateBook)

// router.delete("/:id", checkAuth, Controller.deleteBook)

module.exports = router;