const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String, required: false,
    trim: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password: {
    type: String
  },
  facebookProvider: {
    type: {
      id: String,
      name: String,
      avatar: String,
      gender: String,
      birthday: String
    }
  },
  expiresAt: {
    type: Number
  },
  refreshToken: {
    type: String
  }
})
const userModel = mongoose.model("User", userSchema);

module.exports = userModel;