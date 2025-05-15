import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import AudioCallManager from "../components/AudioCallManager";
import ChatBox from "../components/ChatBox";
const SAVE_INTERVAL_MS = 2000;

function TextEditor() {
  const { id: documentId } = useParams();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [content, setContent] = useState("");
  const [status, setStatus] = useState("⏳ Connexion…");
  const [hasAccess, setHasAccess] = useState(false);

  const socketRef = useRef(null);
  const contentRef = useRef("");

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
          toast.error("Erreur lors du chargement du document");
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">📝 Éditeur texte</h2>
        <div>
          <span className="me-3 text-muted">{status}</span>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8 mb-4">
          <textarea
            className="form-control"
            style={{ minHeight: "400px", fontFamily: "monospace" }}
            value={content}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <AudioCallManager documentId={documentId} />
              <hr />
              <ChatBox documentId={documentId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextEditor;
