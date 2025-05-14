import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import CallManager from "../components/CallManager";

const SAVE_INTERVAL_MS = 2000; // auto-save toutes les 2 secondes

function TextEditor() {
  const { id: documentId } = useParams();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [content, setContent] = useState("");
  const [status, setStatus] = useState("⏳ Connexion…");
  const [hasAccess, setHasAccess] = useState(false);

  const socketRef = useRef(null);
  const contentRef = useRef(""); // évite des conflits de synchro

  // Chargement initial via REST pour contrôle d'accès
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/documents/${documentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          if (res.status === 403) {
            toast.error("Accès refusé à ce document");
          } else {
            toast.error("Erreur lors du chargement du document");
          }
          return;
        }

        const doc = await res.json();
        setHasAccess(true);
        setContent(doc.content || "");
        contentRef.current = doc.content || "";
      } catch (err) {
        toast.error("Erreur réseau");
      }
    };

    fetchDocument();
  }, [documentId]);

  // Initialisation socket si autorisé
  useEffect(() => {
    if (!hasAccess) return;

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
  }, [documentId, hasAccess]);

  // Auto-save
  useEffect(() => {
    if (!hasAccess) return;

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
  }, [documentId, user, hasAccess]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setContent(newValue);
    contentRef.current = newValue;
    socketRef.current?.emit("send-changes", {
      documentId,
      delta: newValue,
    });
  };

  if (!hasAccess) {
    return (
      <div className="container mt-5 text-center text-danger">
        <h4>⛔ Accès non autorisé au document</h4>
      </div>
    );
  }

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
      <CallManager documentId={documentId} />
    </div>
  );
}

export default TextEditor;
