require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const auth = require("./middlewares/auth");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => {
    console.error("Erreur de connexion MongoDB:", err);
    process.exit(1);
  });

// ✅ Test de base
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend with MongoDB!" });
});

app.post("/api/register", async (req, res) => {
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

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Champs manquants" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Identifiants incorrects" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid)
    return res.status(401).json({ error: "Identifiants incorrects" });

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token, email: user.email, username: user.username });
});

app.get("/api/me", auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  res.json(user);
});

app.put("/api/me", auth, async (req, res) => {
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
      user: {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch {
    res.status(500).json({ error: "Erreur mise à jour" });
  }
});

app.put("/api/me/password", auth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ error: "Les mots de passe ne correspondent pas" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Mot de passe trop court (min. 6 caractères)" });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user)
      return res.status(404).json({ error: "Utilisateur introuvable" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Mot de passe mis à jour" });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
