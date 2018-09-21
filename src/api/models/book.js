const mongoose = require("mongoose");
const Collection = require("./collection");

const bookSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  category: { type: mongoose.Schema.Types.ObjectId, ref: Collection.COLLECTION_CATEGORY, required: true },
  title: { type: String, required: true },
  cover: { type: String, required: false },
  coverLink: { type: String, required: false },// Link cover to webpage
  subtitle: { type: String, required: false },
  author: { type: String, required: false },
  description: { type: String, required: false },
  tag: { type: String, required: false },
  translator: { type: String, required: false },
  publisher: { type: String, required: false },
  ebook: { type: String, required: false },
  ebookLink: { type: String, required: false },
  format: { type: String, required: false },
  reader: { type: String, required: false },
  view: { type: Number, required: false },
  mbookLink: { type: Array, required: false }// array of link chapter
})
const bookModel = mongoose.model(Collection.COLLECTION_BOOK, bookSchema);

module.exports = bookModel; 