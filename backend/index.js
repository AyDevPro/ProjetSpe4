const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

connectDB(); // Connecte MongoDB

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend with MongoDB!" });
});

// 👉 Route : création d'un user
app.post("/api/user", async (req, res) => {
  const user = new User({ username: "aymeric", email: "aymeric@exemple.com" });
  await user.save();
  res.json(user);
});

// 👉 Route : récupération de tous les users
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
