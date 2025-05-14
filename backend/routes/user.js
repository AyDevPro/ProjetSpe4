const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth");
const User = require("../models/User");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    let user;

    if (req.user.userId) {
      user = await User.findById(req.user.userId).select("-password");
    } else if (req.user.email && req.user.authProvider === "google") {
      user = await User.findOne({
        email: req.user.email,
        authProvider: "google",
      }).select("-password");
    }

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/me", auth, async (req, res) => {
  const { username, email, avatar } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user)
      return res.status(404).json({ error: "Utilisateur introuvable" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({
      message: "Profil mis à jour",
      user: { username: user.username, email: user.email, avatar: user.avatar },
    });
  } catch {
    res.status(500).json({ error: "Erreur mise à jour" });
  }
});

router.put("/me/password", auth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword)
    return res.status(400).json({ error: "Champs manquants" });

  if (newPassword !== confirmPassword)
    return res
      .status(400)
      .json({ error: "Les mots de passe ne correspondent pas" });

  if (newPassword.length < 6)
    return res
      .status(400)
      .json({ error: "Mot de passe trop court (min. 6 caractères)" });

  try {
    const user = await User.findById(req.user.userId);
    if (!user)
      return res.status(404).json({ error: "Utilisateur introuvable" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Mot de passe mis à jour" });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer tous les utilisateurs (pour partage, etc.)
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({}, "username email _id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
});

module.exports = router;
