const express = require("express");
const router = express.Router();
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/");
  },
  filename: function (req, file, callback) {
    callback(null, new Date().toISOString() + file.originalname);
  }
})
const fileFilter = (req, file, cb) => {
  // Reject a file
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false)
  }
}
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter
});

const Controller = require("../controllers/book");

router.get("/", Controller.getAllBooks);

router.post("/", checkAuth, upload.single("file"), Controller.createBook);

router.get("/:id", Controller.getBook);

router.patch("/:id", checkAuth, Controller.updateBook)

router.delete("/:id", checkAuth, Controller.deleteBook)

module.exports = router;