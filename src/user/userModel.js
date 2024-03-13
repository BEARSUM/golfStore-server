const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: 1,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: {
      streetAddress: { type: String },
      detailAddress: { type: String },
      postalCode: { type: String },
    },
    //required: true,
  },
  birthdate: {
    type: Date,
    //required: true,
  },
  phoneNumber: {
    type: String,
    //required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  refreshToken: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
