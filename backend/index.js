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
const passport = require("passport");
require("./config/passport");
const activeCalls = {};

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

app.use(passport.initialize());

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

const broadcastCallParticipants = (documentId) => {
  const list = activeCalls[documentId]
    ? [...activeCalls[documentId]].map(([socketId, username]) => ({
        socketId,
        username,
      }))
    : [];

  // On envoie à tous les membres de la salle du document (et pas seulement du call)
  io.to(documentId).emit("current-participants", list);
};

io.on("connection", (socket) => {
  console.log("✅ Client connecté :", socket.id);

  socket.on("join-document", async (documentId) => {
    socket.join(documentId);
    console.log(`📄 ${socket.id} a rejoint le document ${documentId}`);

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: "ID de document invalide" });
    }
    const doc = await Document.findById(documentId);

    if (doc) {
      socket.emit("load-document", doc.content || "");
      if (activeCalls[documentId]) {
      }
    }
  });

  socket.on("send-changes", ({ documentId, delta }) => {
    socket.to(documentId).emit("receive-changes", delta);
  });

  socket.on("save-document", async ({ documentId, content, userId }) => {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: "ID de document invalide" });
    }
    await Document.findByIdAndUpdate(documentId, {
      content,
      lastModified: new Date(),
      lastModifiedBy: userId,
    });
    console.log(`💾 Document ${documentId} sauvegardé`);
  });

  socket.on("join-call", ({ documentId, username }) => {
    const room = `call-${documentId}`;
    socket.join(room);

    if (!activeCalls[documentId]) activeCalls[documentId] = new Map();
    activeCalls[documentId].set(socket.id, username);

    // Annonce aux autres
    socket.to(room).emit("user-joined-call", {
      socketId: socket.id,
      username,
    });

    // Envoie la liste des participants au nouveau venu
    const list = [...activeCalls[documentId]].map(([socketId, username]) => ({
      socketId,
      username,
    }));
    broadcastCallParticipants(documentId);
  });

  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("leave-call", ({ documentId }) => {
    const room = `call-${documentId}`;
    socket.leave(room);
    if (activeCalls[documentId]) {
      activeCalls[documentId].delete(socket.id);
      socket.to(room).emit("user-left-call", socket.id);
    }
    broadcastCallParticipants(documentId);
  });

  socket.on("disconnect", () => {
    // Parcours tous les appels actifs
    for (const [docId, participants] of Object.entries(activeCalls)) {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        io.to(`call-${docId}`).emit("user-left-call", socket.id);

        // 🔁 Mets à jour tous les utilisateurs du document concerné
        broadcastCallParticipants(docId);

        if (participants.size === 0) {
          delete activeCalls[docId];
        }
      }
    }

    console.log("❌ Client déconnecté :", socket.id);
  });

  socket.on("get-call-participants", (documentId) => {
    const room = `call-${documentId}`;
    const list = activeCalls[documentId]
      ? [...activeCalls[documentId]].map(([socketId, username]) => ({
          socketId,
          username,
        }))
      : [];
    socket.emit("current-participants", list);
  });

  socket.on("send-chat-message", ({ documentId, username, message }) => {
    if (!username || !message || message.length > 2000) {
      return;
    }

    io.to(documentId).emit("receive-chat-message", {
      username,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("join-chat", (documentId) => {
    socket.join(documentId);
    console.log(`📄 ${socket.id} a rejoint le chat du document ${documentId}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
