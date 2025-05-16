// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const User = require("../models/User");

// 🟢 Ajouter un utilisateur (admin uniquement)
router.post("/admin/create-user", auth, isAdmin, async (req, res) => {
  const { email, username, password, role = "user" } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Champs requis manquants" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email déjà utilisé" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      username,
      password: hashed,
      role,
    });
    await user.save();

    res.status(201).json({ message: "Utilisateur créé", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🟡 Bloquer un utilisateur
router.post("/admin/block/:id", auth, isAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID d'utilisateur invalide" });
    }
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ error: "Utilisateur introuvable" });

    user.blocked = true;
    await user.save();
    res.json({ message: "Utilisateur bloqué" });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🟢 Débloquer un utilisateur
router.post("/admin/unblock/:id", auth, isAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID d'utilisateur invalide" });
    }
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ error: "Utilisateur introuvable" });

    user.blocked = false;
    await user.save();
    res.json({ message: "Utilisateur débloqué" });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔍 Liste des utilisateurs
router.get("/admin/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "email username role blocked");
    res.json(users);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
