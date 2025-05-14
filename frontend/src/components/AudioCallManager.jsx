import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import CallStatusBadge from "./CallStatusBadge";
import CallParticipantsList from "./CallParticipantsList";

const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
  transports: ["websocket"],
});

function AudioCallManager({ documentId }) {
  const { user } = useAuth();
  const peersRef = useRef({});
  const localStream = useRef(null);
  const audioContainer = useRef();

  const [inCall, setInCall] = useState(false);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    socket.on("user-joined-call", ({ socketId, username }) => {
      setParticipants((prev) => [...prev, { socketId, username }]);
      handleNewPeer(socketId);
    });

    socket.on("user-left-call", (socketId) => {
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }
    });

    socket.on("signal", handleSignal);

    return () => {
      socket.off("user-joined-call");
      socket.off("user-left-call");
      socket.off("signal");
    };
  }, []);

  const joinCall = async () => {
    setInCall(true);
    localStream.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const audio = document.createElement("audio");
    audio.srcObject = localStream.current;
    audio.muted = true;
    audio.autoplay = true;
    audioContainer.current.appendChild(audio);

    socket.emit("join-call", {
      documentId,
      username: user.username || user.email,
    });

    socket.once("current-participants", (list) => {
      setParticipants(list);
    });
  };

  const handleNewPeer = (peerId) => {
    const peer = new RTCPeerConnection();
    peersRef.current[peerId] = peer;

    localStream.current
      .getTracks()
      .forEach((track) => peer.addTrack(track, localStream.current));

    peer.ontrack = (event) => {
      const audio = document.createElement("audio");
      audio.srcObject = event.streams[0];
      audio.autoplay = true;
      audioContainer.current.appendChild(audio);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", {
          to: peerId,
          data: { type: "candidate", candidate: event.candidate },
        });
      }
    };

    peer
      .createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .then(() => {
        socket.emit("signal", {
          to: peerId,
          data: { type: "offer", sdp: peer.localDescription },
        });
      });
  };

  const handleSignal = async ({ from, data }) => {
    let peer = peersRef.current[from];
    if (!peer) {
      peer = new RTCPeerConnection();
      peersRef.current[from] = peer;

      localStream.current
        .getTracks()
        .forEach((track) => peer.addTrack(track, localStream.current));

      peer.ontrack = (event) => {
        const audio = document.createElement("audio");
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audioContainer.current.appendChild(audio);
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("signal", {
            to: from,
            data: { type: "candidate", candidate: event.candidate },
          });
        }
      };
    }

    if (data.type === "offer") {
      await peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("signal", {
        to: from,
        data: { type: "answer", sdp: peer.localDescription },
      });
    } else if (data.type === "answer") {
      await peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
    } else if (data.type === "candidate") {
      await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const leaveCall = () => {
    socket.emit("leave-call", { documentId });
    Object.values(peersRef.current).forEach((peer) => peer.close());
    peersRef.current = {};
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
    setInCall(false);
    setParticipants([]);
    audioContainer.current.innerHTML = "";
  };

  return (
    <div className="card mt-4 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="card-title mb-0">📞 Appel audio</h5>
          <CallStatusBadge documentId={documentId} />
        </div>

        <div className="mb-3">
          {!inCall ? (
            <button
              className="btn btn-outline-success btn-sm"
              onClick={joinCall}
            >
              ▶️ Rejoindre
            </button>
          ) : (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={leaveCall}
            >
              ❌ Quitter
            </button>
          )}
        </div>

        <hr />
        <h6 className="text-muted mb-2">👤 Participants connectés</h6>
        <CallParticipantsList documentId={documentId} />

        <div ref={audioContainer} />
      </div>
    </div>
  );
}

export default AudioCallManager;
