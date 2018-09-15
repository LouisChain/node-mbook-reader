const mongoose = require("mongoose");
const Collection = require("./collection");

const chapterSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true },
  path: { type: String, required: true }
})
const chapterModel = mongoose.model(Collection.COLLECTION_CHAPTER, chapterSchema);

module.exports = chapterModel; 