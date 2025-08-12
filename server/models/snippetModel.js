// models/snippetModel.js
const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // Reference to a User's ID
      required: true,
      ref: "User", // Links this to the User model
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
    },
    language: {
      type: String,
      required: [true, "Please add a language"],
    },
    code: {
      type: String,
      required: [true, "Please add a code block"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Snippet", snippetSchema);
