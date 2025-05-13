const express = require("express");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const User = require("../models/User");

const router = express.Router();

router.post("/generate", auth, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `MonApp (${req.user.email})`,
  });

  try {
    const user = await User.findById(req.user.userId);
    user.twoFactorTempSecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ error: "Erreur QR code" });
      res.json({ qr: data_url, secret: secret.base32 });
    });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/verify", auth, async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.userId);

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorTempSecret,
    encoding: "base32",
    token,
  });

  if (verified) {
    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorTempSecret = undefined;
    await user.save();
    return res.json({ message: "2FA activé ✅" });
  }

  res.status(400).json({ error: "Code invalide" });
});

router.post("/validate", async (req, res) => {
  const { userId, token } = req.body;
  const user = await User.findById(userId);

  if (!user || !user.twoFactorSecret)
    return res.status(403).json({ error: "2FA non activé" });

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (verified) {
    const newToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    return res.json({ token: newToken });
  }

  res.status(401).json({ error: "Code 2FA invalide" });
});

// 🔓 Désactivation du 2FA
router.post("/disable", auth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  user.twoFactorSecret = undefined;
  user.twoFactorTempSecret = undefined;
  await user.save();

  res.json({ message: "2FA désactivé" });
});

module.exports = router;
