import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

function CallStatusBadge({ documentId }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      transports: ["websocket"],
    });

    const refresh = () => socket.emit("get-call-participants", documentId);
    const updateList = (list) => setCount(list.length);

    socket.on("current-participants", updateList);
    socket.on("user-joined-call", refresh);
    socket.on("user-left-call", refresh);

    const interval = setInterval(refresh, 2000);

    // Premier appel immédiat
    refresh();

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [documentId, user]);

  return (
    <span className="badge bg-secondary ms-2">
      👥 {count} participant{count > 1 ? "s" : ""}
    </span>
  );
}

export default CallStatusBadge;
