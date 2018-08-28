let express = require("express");
let app = express();
let server = require("http").createServer(app);
server.listen(3000);

app.get("/", function (req, res) {
  // res.send("<font color=green>Hello Express</font>");
  res.sendFile(__dirname + "/index.html");
})

app.get("/params/:p1/:p2", function (req, res) {
  // res.send("<font color=green>Hello Express</font>");
  let n = parseInt(req.params.p1) + parseInt(req.params.p2);
  let result = "Ket qua " + n;
  res.send("<h1>" + result + "</h1>");
})

//
//1. Require mongoose
let mongoose = require("mongoose");
//2. Connect
mongoose.connect("mongodb://localhost/MBookReader");
//3. Create schema
let bookSchema = new mongoose.Schema({
  name: String,
  type: String
})
//4. Creat model
let userModel = mongoose.model("books", bookSchema);
//5. CRUD

// userModel.create({
//   name: "Currency war",
//   type: "epub"
// });

// userModel.find().exec((err, res) => {
//   console.log(res);
// })

// userModel
//   .update({ name: "Currency war" }, { type: "nothing" })
//   .exec((err, res) => {
//     console.log(res);
//   })

// userModel
//   .remove({ type: "epub" })
//   .exec((err, res) => {
//     console.log(res);
//   })