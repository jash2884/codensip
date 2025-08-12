// models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
    },
    profilePictureData: {
      type: Buffer, // For storing binary image data
    },
    profilePictureMimetype: {
      type: String, // e.g., 'image/jpeg'
    },
  },
  {
    timestamps: true,
  }
);

// When creating a new user, set displayName to username by default
userSchema.pre("save", function (next) {
  if (this.isNew && !this.displayName) {
    this.displayName = this.username;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
