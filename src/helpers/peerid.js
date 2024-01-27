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
        { url: "stun:matze-server.net:3478" },
        {
          url: "turn:matze-server.net:3478",
          credential:
            "5c4750c474320b5fdc63470be5d6a4a3c4b4a89ed67894b345b4e3515196d12d",
        },
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
