import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
  transports: ["websocket"],
});

function CallManager({ documentId }) {
  const [inCall, setInCall] = useState(false);
  const peersRef = useRef({});
  const localStream = useRef(null);
  const audioContainer = useRef();

  useEffect(() => {
    // Écoute les signaux entrants
    socket.on("user-joined-call", handleNewPeer);
    socket.on("signal", handleSignal);
    socket.on("user-left-call", handleUserLeft);

    return () => {
      socket.off("user-joined-call");
      socket.off("signal");
      socket.off("user-left-call");
    };
  }, []);

  const joinCall = async () => {
    setInCall(true);
    localStream.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    // Envoie l'audio local (optionnel : préécoute)
    const audio = document.createElement("audio");
    audio.srcObject = localStream.current;
    audio.muted = true;
    audio.autoplay = true;
    audioContainer.current.appendChild(audio);

    socket.emit("join-call", { documentId });
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

  const handleUserLeft = (peerId) => {
    if (peersRef.current[peerId]) {
      peersRef.current[peerId].close();
      delete peersRef.current[peerId];
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
    audioContainer.current.innerHTML = "";
  };

  return (
    <div className="mt-3">
      {!inCall ? (
        <button className="btn btn-success btn-sm" onClick={joinCall}>
          📞 Rejoindre l'appel
        </button>
      ) : (
        <button className="btn btn-danger btn-sm" onClick={leaveCall}>
          ❌ Quitter l'appel
        </button>
      )}
      <div ref={audioContainer}></div>
    </div>
  );
}

export default CallManager;
