const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Connect mongoose
mongoose.connect("mongodb://localhost:27017/MBookReader", {
  useNewUrlParser: true
});

// Routes
const bookRoutes = require("./api/routes/books")
const storeRoutes = require("./api/routes/store")
const userRoutes = require("./api/routes/user")

// Middlewares
app.use(morgan("dev"))
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Acess-Control-Allo-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, GET, DELETE");
    return res.status(200).json({});
  }
  next();
})

// Api handling
app.use("/books", bookRoutes);
app.use("/store", storeRoutes);
app.use("/user", userRoutes);

// Error handling
app.use((req, res, next) => {
  let error = new Error("not found");
  error.status = 404;
  next(error);
})
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message
  })
})

module.exports = app;