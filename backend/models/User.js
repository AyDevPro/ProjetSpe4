const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: String,
  avatar: String,
  twoFactorSecret: String,
  twoFactorTempSecret: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  blocked: { type: Boolean, default: false },
  authProvider: String,
});

module.exports = mongoose.model("User", userSchema);
