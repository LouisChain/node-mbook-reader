const mongoose = require("mongoose");
const Collection = require("./collection");

const bookSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  category: { type: mongoose.Schema.Types.ObjectId, ref: Collection.COLLECTION_CATEGORY, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: false },
  cover: { type: String, required: true }
})
const bookModel = mongoose.model(Collection.COLLECTION_BOOK, bookSchema);

module.exports = bookModel;