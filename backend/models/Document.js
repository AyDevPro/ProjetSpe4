const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  name: String,
  type: String, // "text", "file"
  content: String, // pour les documents texte
  fileUrl: String, // pour les fichiers PDF, image...
  lastModified: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hiddenFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Document", documentSchema);
