const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  file : { type: String, required: true}
})
const bookModel = mongoose.model("Book", bookSchema);

module.exports = bookModel;