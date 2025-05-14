require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const twoFARoutes = require("./routes/2fa");
const adminRoutes = require("./routes/admin");
const Document = require("./models/Document");
const User = require("./models/User");
const bcrypt = require("bcrypt");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json({ limit: "5mb" }));

connectDB().then(createAdminIfNotExists);

async function createAdminIfNotExists() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "⚠️ ADMIN_EMAIL ou ADMIN_PASSWORD non défini dans .env. Aucun admin créé."
    );
    return;
  }

  const exists = await User.findOne({ email });
  if (!exists) {
    const hashed = await bcrypt.hash(password, 10);
    const admin = new User({
      email,
      username: "admin",
      password: hashed,
      role: "admin",
    });
    await admin.save();
    console.log("✅ Compte admin créé :", email);
  } else {
    console.log("ℹ️ Compte admin déjà existant");
  }
}

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend with MongoDB!" });
});

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/2fa", twoFARoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api", require("./routes/document"));
app.use("/api", adminRoutes);

io.on("connection", (socket) => {
  console.log("✅ Client connecté :", socket.id);

  socket.on("join-document", async (documentId) => {
    socket.join(documentId);
    console.log(`📄 ${socket.id} a rejoint le document ${documentId}`);

    const doc = await Document.findById(documentId);
    if (doc) {
      socket.emit("load-document", doc.content || "");
    }
  });

  socket.on("send-changes", ({ documentId, delta }) => {
    socket.to(documentId).emit("receive-changes", delta);
  });

  socket.on("save-document", async ({ documentId, content, userId }) => {
    await Document.findByIdAndUpdate(documentId, {
      content,
      lastModified: new Date(),
      lastModifiedBy: userId,
    });
    console.log(`💾 Document ${documentId} sauvegardé`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client déconnecté :", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
