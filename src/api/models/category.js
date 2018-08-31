const mongoose = require("mongoose");
const Collection = require("./collection");

const categorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String, 
    required: true
  },
  description: { type: String, required: false }
})
const categoryModel = mongoose.model(Collection.COLLECTION_CATEGORY, categorySchema);

module.exports = categoryModel;