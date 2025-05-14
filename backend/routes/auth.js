const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Champs manquants" });

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ email, password: hashedPassword, username });
    await user.save();
    res.status(201).json({ message: "Utilisateur créé" });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: "Email déjà utilisé" });
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Champs manquants" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Identifiants incorrects" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid)
    return res.status(401).json({ error: "Identifiants incorrects" });

  if (user.blocked) {
    return res.status(403).json({ error: "Compte bloqué, contactez un admin" });
  }

  // Si le 2FA est activé, on demande une vérification supplémentaire
  if (user.twoFactorSecret) {
    return res.json({
      twoFactor: true,
      userId: user._id,
      email: user.email,
      username: user.username,
    });
  }

  // Sinon, on envoie le token directement
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token, email: user.email, username: user.username });
});

module.exports = router;
