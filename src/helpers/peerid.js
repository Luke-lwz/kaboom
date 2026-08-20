const peerjsid = import.meta.env.VITE_PEERJS_ID;

export function constructPeerID(gameID, playerID) {
  return `${gameID}-${playerID}-${peerjsid}`;
}

export function sendConstructor(myid, data, options = {}) {
  return { myid, data, options };
}

// Fetch TURN/STUN server configurations for PeerJS connections.
// Motivation: On mobile networks (like iOS Safari), fetching external TURN configs can occasionally fail or time out.
// Providing a fallback STUN server configuration ensures PeerJS initialization never crashes unexpectedly.
export async function getPeerConfig() {
  let iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

  try {
    // Attempt to fetch custom TURN server configuration from external service.
    const ice_result = await fetch("https://personal-api-xecora.fly.dev/get-turn-config", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

    if (ice_result.ok) {
      const ice = await ice_result.json();
      if (Array.isArray(ice) && ice.length > 0) {
        iceServers = ice;
      }
    }
  } catch (error) {
    // Log warning and fallback to default STUN server if fetch fails.
    console.warn("⚠️ getPeerConfig: Failed to fetch TURN config, falling back to default STUN server.", error);
  }

  return {
    secure: true,
    host: "peerjs-server-1759387413.fly.dev",
    port: 443,
    key: "peerjs",
    allow_discovery: true,
    config: {
      iceServers: iceServers,
    },
  };
}

