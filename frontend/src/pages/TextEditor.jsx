import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SAVE_INTERVAL_MS = 2000; // auto-save toutes les 2 secondes

function TextEditor() {
  const { id: documentId } = useParams();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [content, setContent] = useState("");
  const [status, setStatus] = useState("⏳ Connexion…");
  const socketRef = useRef(null);
  const contentRef = useRef(""); // évite des conflits de synchro

  // Initialisation socket
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("🟢 Connecté");
      socket.emit("join-document", documentId);
    });

    socket.on("load-document", (loadedContent) => {
      setContent(loadedContent);
      contentRef.current = loadedContent;
    });

    socket.on("receive-changes", (delta) => {
      setContent(delta);
      contentRef.current = delta;
    });

    return () => {
      socket.disconnect();
    };
  }, [documentId]);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (socketRef.current && user) {
        socketRef.current.emit("save-document", {
          documentId,
          content: contentRef.current,
          userId: user._id,
        });
      }
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [documentId, user]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setContent(newValue);
    contentRef.current = newValue;
    socketRef.current?.emit("send-changes", {
      documentId,
      delta: newValue,
    });
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="mb-0">📝 Éditeur texte</h2>
        <span style={{ fontSize: "0.9em", color: "#555" }}>{status}</span>
      </div>
      <textarea
        className="form-control"
        style={{ minHeight: "300px", fontFamily: "monospace" }}
        value={content}
        onChange={handleChange}
      />
    </div>
  );
}

export default TextEditor;
