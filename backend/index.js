require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const twoFARoutes = require("./routes/2fa");
const Document = require("./models/Document");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // à sécuriser plus tard
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json({ limit: "5mb" }));

connectDB();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend with MongoDB!" });
});

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/2fa", twoFARoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api", require("./routes/document"));

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
