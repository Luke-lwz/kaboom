import tutorial from "../config/playsets/tutorial.json"
import official from "../config/playsets/official.json"
import friends from "../config/playsets/friends.json"
import necroboomicon from "../config/playsets/necroboomicon.json"
import dev from "../config/playsets/dev.json"





import { getCardFromId } from "./cards.js"



export const PLAYSET_COLORS = {
    tutorial: "#c342ff",
    official: "#427bff",
    friends: "#0da312",
    necroboomicon: "#9cde47",
    dev: "#FBBD23"
}
const PLAYSETS = { tutorial, official, friends, necroboomicon, dev };

export function getPlaysetsWithCards() {
    var outPlaysets = {};

    for (let key in PLAYSETS) {
        var value = PLAYSETS[key];

        let v = value.map(playset => {
            let cards = playset?.cards?.map(cid => getCardFromId(cid)) || [];
            let primaries = playset?.primaries?.map(cid => getCardFromId(cid)) || [];
            let default_cards = playset?.default_cards?.map(cid => getCardFromId(cid)) || null;
            if (playset?.odd_card && playset.odd_card !== "") var odd_card = getCardFromId(playset.odd_card);
            return { ...playset, cards, odd_card, primaries, default_cards, color: PLAYSET_COLORS[key] };
        })


        outPlaysets = { ...outPlaysets, [key]: v };
    }

    return outPlaysets;
}



export function getAllPlaysetsArray() {
    const ps = getPlaysetsWithCards();
    var outArr = [];

    for (let key in ps) {
        outArr = [...outArr, ...ps[key]];
    }

    return outArr;
}


export function getPlaysetById(id) {
    const playsets = getAllPlaysetsArray();
    const set = playsets.filter(p => p.id === id)?.[0] || null;
    return set;
}



export function getLastPlayedPlaysets() {
    const playsetsString = localStorage.getItem("last-played-playsets");
    if (playsetsString) {
        var playsets = JSON.parse(playsetsString);
        if (Array.isArray(playsets)) {
            return playsets.map(p => getPlaysetById(p));
        }

    }

    return null
}