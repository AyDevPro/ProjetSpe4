const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant ou mal formé" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // On stocke les infos du token pour la suite
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token invalide" });
  }
};

module.exports = authMiddleware;
