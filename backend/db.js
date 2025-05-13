const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGODB_URI;

const connectDB = async () => {
  if (!mongoUri) {
    console.error(
      "❌ MONGODB_URI manquant ! Ajoutez-le dans .env ou dans les variables d’environnement."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connecté :", mongoUri);
  } catch (err) {
    console.error("❌ Erreur connexion MongoDB :", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
