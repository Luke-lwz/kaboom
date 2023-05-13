
const peerjsid = import.meta.env.VITE_PEERJS_ID;



export function constructPeerID(gameID, playerID) {
    return `${gameID}-${playerID}-${peerjsid}`;
}



export function sendConstructor(myid, data, options = {}) {
    return {myid, data, options}
}