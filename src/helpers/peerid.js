const peerjsid = import.meta.env.VITE_PEERJS_ID;

export function constructPeerID(gameID, playerID) {
  return `${gameID}-${playerID}-${peerjsid}`;
}

export function sendConstructor(myid, data, options = {}) {
  return { myid, data, options };
}

export function getPeerConfig() {
  return {
    config: {
      iceServers: [
        { url: "stun:stun.l.google.com:19302" },
        { url: "turn:homeo@turn.bistri.com:80", credential: "homeo" },
      ],
    } /* Sample servers, please use appropriate ones */,
  };
  return undefined;
  return {
    secure: true,
    host: "peerjs-kaboom-custom-server.onrender.com",
    port: 443,
  };
}
