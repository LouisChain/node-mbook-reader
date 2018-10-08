const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const Controller = require("../controllers/store");

router.get("/", checkAuth, Controller.fetchStore);

router.get("/category", checkAuth, Controller.getByCategory);

router.get("/search", checkAuth, Controller.search);
// router.post("/", checkAuth, upload.single("file"), Controller.createBook);

// router.get("/:id", Controller.getBook);

// router.patch("/:id", checkAuth, Controller.updateBook)

// router.delete("/:id", checkAuth, Controller.deleteBook)

module.exports = router;