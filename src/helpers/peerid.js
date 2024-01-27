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
      iceServers: [
        {
          url: "stun:global.stun.twilio.com:3478",
          urls: "stun:global.stun.twilio.com:3478",
        },
        {
          url: "turn:global.turn.twilio.com:3478?transport=udp",
          username:
            "be0e259e8abbd8eb3b8f490af28eac7a21b3652f0adf5ab5f363a9bdd86bb030",
          urls: "turn:global.turn.twilio.com:3478?transport=udp",
          credential: "m3Fs3VNU6d776zO2ulIaHpbGnv9qDLQekhwucqiNHNM=",
        },
        {
          url: "turn:global.turn.twilio.com:3478?transport=tcp",
          username:
            "be0e259e8abbd8eb3b8f490af28eac7a21b3652f0adf5ab5f363a9bdd86bb030",
          urls: "turn:global.turn.twilio.com:3478?transport=tcp",
          credential: "m3Fs3VNU6d776zO2ulIaHpbGnv9qDLQekhwucqiNHNM=",
        },
        {
          url: "turn:global.turn.twilio.com:443?transport=tcp",
          username:
            "be0e259e8abbd8eb3b8f490af28eac7a21b3652f0adf5ab5f363a9bdd86bb030",
          urls: "turn:global.turn.twilio.com:443?transport=tcp",
          credential: "m3Fs3VNU6d776zO2ulIaHpbGnv9qDLQekhwucqiNHNM=",
        },
      ],
    },
  };

  return undefined;
  return {
    secure: true,
    host: "peerjs-kaboom-custom-server.onrender.com",
    port: 443,
  };
}
