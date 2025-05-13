const express = require("express");
const auth = require("../middlewares/auth");
const Document = require("../models/Document");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// 🟢 GET documents accessibles
router.get("/documents", auth, async (req, res) => {
  const docs = await Document.find({
    $or: [{ owner: req.user.userId }, { collaborators: req.user.userId }],
  })
    .populate("lastModifiedBy", "username")
    .sort({ lastModified: -1 });

  res.json(docs);
});

// 🟢 GET fichier uploadé (image ou PDF)
router.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "..", "uploads", req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Fichier introuvable" });
  }
  res.sendFile(filePath);
});

// 🟢 POST document texte
router.post("/documents", auth, async (req, res) => {
  const { name, content } = req.body;
  if (!name) return res.status(400).json({ error: "Nom requis" });

  const doc = new Document({
    name,
    type: "text",
    content: content || "",
    owner: req.user.userId,
    lastModifiedBy: req.user.userId,
  });

  await doc.save();
  res.status(201).json(doc);
});

// 🟢 POST document fichier
router.post(
  "/documents/upload",
  auth,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Fichier manquant" });

    const doc = new Document({
      name: req.file.originalname,
      type: "file",
      fileUrl: `/uploads/${req.file.filename}`,
      owner: req.user.userId,
      lastModifiedBy: req.user.userId,
    });

    await doc.save();
    res.status(201).json(doc);
  }
);

// 🟡 PUT modification document
router.put("/documents/:id", auth, async (req, res) => {
  const { content, name } = req.body;
  const doc = await Document.findById(req.params.id);

  if (!doc) return res.status(404).json({ error: "Document introuvable" });

  const isAuthorized =
    doc.owner.equals(req.user.userId) ||
    doc.collaborators.includes(req.user.userId);

  if (!isAuthorized) return res.status(403).json({ error: "Accès interdit" });

  if (name) doc.name = name;
  if (content !== undefined) doc.content = content;
  doc.lastModified = new Date();
  doc.lastModifiedBy = req.user.userId;

  await doc.save();
  res.json(doc);
});

// 🔴 DELETE document
router.delete("/documents/:id", auth, async (req, res) => {
  const doc = await Document.findById(req.params.id);

  if (!doc) return res.status(404).json({ error: "Document introuvable" });
  if (!doc.owner.equals(req.user.userId))
    return res.status(403).json({ error: "Accès interdit" });

  // Supprime le fichier si c’est un upload
  if (doc.type === "file" && doc.fileUrl) {
    const filePath = path.join(__dirname, "..", doc.fileUrl);
    fs.unlink(filePath, () => {});
  }

  await doc.deleteOne();
  res.json({ message: "Document supprimé" });
});

// 👥 POST invitation
router.post("/documents/:id/invite", auth, async (req, res) => {
  const { email } = req.body;
  const doc = await Document.findById(req.params.id);
  const User = require("../models/User");
  const invited = await User.findOne({ email });

  if (!doc || !invited)
    return res
      .status(404)
      .json({ error: "Document ou utilisateur introuvable" });

  if (!doc.owner.equals(req.user.userId))
    return res.status(403).json({ error: "Seul le propriétaire peut inviter" });

  if (doc.collaborators.includes(invited._id))
    return res.status(400).json({ error: "Déjà collaborateur" });

  doc.collaborators.push(invited._id);
  await doc.save();

  res.json({ message: "Utilisateur invité avec succès" });
});

module.exports = router;
