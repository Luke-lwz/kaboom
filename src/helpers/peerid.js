const peerjsid = import.meta.env.VITE_PEERJS_ID;

export function constructPeerID(gameID, playerID) {
  return `${gameID}-${playerID}-${peerjsid}`;
}

export function sendConstructor(myid, data, options = {}) {
  return { myid, data, options };
}

export function getPeerConfig() {
  return {
    secure: true,
    host: "peerjs-kaboom-custom-server.onrender.com",
    port: 443,
    key: "peerjs",
    allow_discovery: true,
    config: {
      iceServers: [{
        "url": "stun:global.stun.twilio.com:3478",
        "urls": "stun:global.stun.twilio.com:3478"
    }, {
        "url": "turn:global.turn.twilio.com:3478?transport=udp",
        "username": "3150ecd019ec7194358bb95cb0b8fd2c68a8c00075a242e2e3546eb8cb53fc3e",
        "urls": "turn:global.turn.twilio.com:3478?transport=udp",
        "credential": "jVsaIlUbQoJ14BO2utaGyo5DUDv+17d7t3SEpiTLthI="
    }, {
        "url": "turn:global.turn.twilio.com:3478?transport=tcp",
        "username": "3150ecd019ec7194358bb95cb0b8fd2c68a8c00075a242e2e3546eb8cb53fc3e",
        "urls": "turn:global.turn.twilio.com:3478?transport=tcp",
        "credential": "jVsaIlUbQoJ14BO2utaGyo5DUDv+17d7t3SEpiTLthI="
    }, {
        "url": "turn:global.turn.twilio.com:443?transport=tcp",
        "username": "3150ecd019ec7194358bb95cb0b8fd2c68a8c00075a242e2e3546eb8cb53fc3e",
        "urls": "turn:global.turn.twilio.com:443?transport=tcp",
        "credential": "jVsaIlUbQoJ14BO2utaGyo5DUDv+17d7t3SEpiTLthI="
    }],
    },
  };

  return undefined;
  return {
    secure: true,
    host: "peerjs-kaboom-custom-server.onrender.com",
    port: 443,
  };
}
