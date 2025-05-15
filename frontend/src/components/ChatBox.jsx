import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

function ChatBox({ documentId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("join-chat", documentId);

    socket.on("receive-chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [documentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMsg = {
      username: user.username || user.email,
      message,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit("send-chat-message", {
      documentId,
      ...newMsg,
    });

    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-4">
      <h6 className="mb-2">💬 Chat</h6>
      <div
        className="border rounded p-3 mb-2 bg-white"
        style={{ height: "250px", overflowY: "auto" }}
      >
        {messages.map((msg, idx) => {
          const isMe = msg.username === (user.username || user.email);
          return (
            <div
              key={idx}
              className={`d-flex flex-column ${
                isMe ? "align-items-end" : "align-items-start"
              } mb-2`}
            >
              <small className="text-muted mb-1">
                {isMe ? "Moi" : msg.username}
              </small>
              <div
                className="px-3 py-2 rounded"
                style={{
                  backgroundColor: isMe ? "#e2e3e5" : "#f1f3f5",
                  maxWidth: "80%",
                }}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Écris un message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="btn btn-dark" onClick={handleSend}>
          Envoyer
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
