const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const User = require("./models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const auth = require("./middlewares/auth");

const app = express();
app.use(cors());
app.use(express.json());

connectDB(); // Connexion à MongoDB

// ✅ Test de base
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend with MongoDB!" });
});

// ✅ Inscription
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Champs manquants" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword, username });
    await user.save();

    res.status(201).json({ message: "Utilisateur créé" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Connexion
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Champs manquants" });
  }

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

// ✅ Infos utilisateur connecté
app.get("/api/me", auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  res.json(user);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
