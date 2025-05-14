import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

function CallParticipantsList({ documentId }) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      transports: ["websocket"],
    });

    const refresh = () => socket.emit("get-call-participants", documentId);
    const updateList = (list) => setParticipants(list);

    socket.on("current-participants", updateList);
    socket.on("user-joined-call", refresh);
    socket.on("user-left-call", refresh);

    const interval = setInterval(refresh, 2000);
    refresh();

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [documentId, user]);

  return (
    <ul className="list-group mt-3">
      {participants.map((p) => (
        <li key={p.socketId} className="list-group-item py-1">
          🧑 {p.username}
        </li>
      ))}
    </ul>
  );
}

export default CallParticipantsList;
