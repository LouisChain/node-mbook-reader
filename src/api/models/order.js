const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  quantity: { type: Number, default: 1 }
})
const storeModel = mongoose.model("Order", storeSchema);

module.exports = storeModel;