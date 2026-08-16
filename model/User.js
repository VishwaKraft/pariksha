const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    profileUrl: {
      type: String,
    },
    whatsAppNumber: {
      type: Number,
    },
    github: {
      type: String,
    },
    behance: {
      type: String,
    },
    skills: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = User = mongoose.model("User", userSchema);
