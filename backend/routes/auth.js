const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const passport = require('passport');

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

  const user = await User.findOne({
    $or: [{ email }, { username: email }],
  });

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

// Route d'authentification Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback après l'authentification Google
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const payload = {
      userId: user._id,
      email: user.email,
      authProvider: "google",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Option 1 - Cookie httpOnly
    // res.cookie("jwt", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    // });

    // localStorage.setItem("token", token);

    // Option 2 - Rediriger vers frontend avec token dans l’URL
    res.redirect(`http://localhost:5173/auth/success?token=${token}`);

    // Par défaut on renvoie le token
    // res.json({ token });
    // res.redirect(`${process.env.FRONTEND_URL}/auth/success/${token}`);
  }
);


module.exports = router;
