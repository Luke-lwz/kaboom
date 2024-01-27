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
      urls: [ 
        "turn:eu-0.turn.peerjs.com:3478", 
        "turn:us-0.turn.peerjs.com:3478", 
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
