require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const twoFARoutes = require("./routes/2fa");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

connectDB();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend with MongoDB!" });
});

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/2fa", twoFARoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
