import BlueCards from "../config/cards/blue.json";
import RedCards from "../config/cards/red.json";
import YellowCards from "../config/cards/yellow.json";
import GreyCards from "../config/cards/grey.json";
import GreenCards from "../config/cards/green.json";
import PurpleCards from "../config/cards/purple.json";
import SpecialCards from "../config/cards/special.json";



// icons
import { FaBomb, FaTheaterMasks } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { GiBrain, GiBottleCap, GiThrownKnife } from "react-icons/gi";
import { MdDarkMode } from "react-icons/md"
import { getPlaysetById } from "./playsets";
import { rng } from "./idgen";


export const CARD_COLOR_ORDER = [
    "blue",
    "red",
    "grey",
    "yellow",
    "green",
    "purple",
    "dark"
]


export const CARD_COLOR_NAMES = {
    red: "r",
    blue: "b",
    grey: "g",
    green: "e",
    purple: "p",
    dark: "d",
    yellow: "y"
}


export const CARD_COLORS = {
    r: {
        primary: "#ec1f2b",
        secondary: "#5e1717",
        text: "#ffffff",
        title: "Red Team",
        icon: FaBomb
    },
    b: {
        primary: "#4f94ff",
        secondary: "#152aed",
        text: "#ffffff",
        title: "Blue Team",
        icon: AiFillStar
    },
    g: {
        primary: "#9e9e9e",
        secondary: "#595959",
        text: "#ffffff",
        title: "Grey Team",
        icon: FaTheaterMasks,
    },
    e: { // e = emerald (green)
        primary: "#18ed1c",
        secondary: "#0c5a27",
        text: "#ffffff",
        title: "Green Team",
        icon: GiBrain,
    },
    p: { // p = purple
        primary: "#AA6DFF",
        secondary: "#554180",
        text: "#ffffff",
        title: "???? Team",
        icon: GiBottleCap,
    },
    d: { // d = dark
        primary: "#000000",
        secondary: "#000000",
        text: "#000000",
        title: "Black Team",
        icon: MdDarkMode,
    },
    y: { // d = dark
        primary: "#ffde26",
        secondary: "#6e4c18",
        text: "#ffffff",
        title: "Yellow Team",
        icon: GiThrownKnife,
    }
}


export function getCardsForPlayset(game_data) {

    var { players, playset, playWithBury } = game_data;



    var { primaries, cards, odd_card, shuffle, default_cards } = playset;

    cards = [...(primaries || []), ...(cards || [])]

    let playingWithDrunk = false

    if (cards.filter(c => c?.id === "p001")[0]) { // drunk card gets removed (will be switched with any card later)
        cards = cards.filter(c => c?.id !== "p001");
        playingWithDrunk = true;
    }

    const playerLength = players.length;


    var length = (playWithBury ? playerLength + 1 : playerLength);

    if (cards.length < length) {
        const n = length - cards.length // how many cards
        const addodd = (n % 2 === 1) // if cards to add is odd

        const rngSeed = rng(0, 1);


        for (let i = 1; i <= n; i++) {
            if (i === n && addodd) { // last odd (if odd and odd_card -> add odd_card else -> random blue or red)
                if (odd_card && odd_card !== "") cards = cards = [odd_card, ...cards];
                else cards = [...cards, getCardFromId((default_cards?.map(c => c?.id) || ["b000", "r000"])[rng(0, 1)])];
            } else {
                cards.push(getCardFromId((i % 2 === rngSeed ? default_cards?.[0]?.id || "b000" : default_cards?.[1]?.id || "r000")));
            }
        }
    } else {
        if (playWithBury && odd_card) cards.push(odd_card);
        else if (length % 2 === 1 && odd_card) cards.unshift(odd_card);
    }




    if (shuffle) { // shuffles in pairs
        var shuffled_cards = [...cards.sort((a, b) => 0.5 - Math.random())];


        for (let i = 0; i < primaries?.length; i++) {
            let primary = primaries[i]
            shuffled_cards = shuffled_cards.sort((x, y) => { return x.id == primary?.id ? -1 : y.id == primary?.id ? 1 : 0; });
        }

        var sCardsWithPairs = [];

        while (shuffled_cards.length > 0) {
            var card = shuffled_cards[0];
            pushCard(card);
            var opposite = (["r", "b"].includes(card?.id[0]) ? getCardFromId(`${(card?.id[0] === "r" ? "b" : "r")}${card?.id.slice(-3)}`) : null)
            if (opposite) pushCard(opposite);
            card?.links.map(c => {
                pushCard(getCardFromId(c));
                return c;
            })
        }


        cards = sCardsWithPairs;





        function pushCard(card) {
            if (shuffled_cards.filter(c => c?.id === card?.id)[0]) {
                var cardIndex = getIndex();
                if (!cardIndex) return
                shuffled_cards.splice(cardIndex, 1);
                sCardsWithPairs.push(card);
            }



            function getIndex() {
                for (let i in shuffled_cards) {
                    const el = shuffled_cards[i];
                    if (el?.id === card?.id) return i;
                }
                return null
            }
        }

    }










    var out_cards = []


    for (let i = 0; i < length; i++) {
        out_cards.push(cards[i]);
    }



    // chooses buried cards
    if (playWithBury) {
        var buriedCard = getBuriedCard(out_cards)


        var removedBuriedCard = false
        out_cards = out_cards.filter((c, i) => {
            if (removedBuriedCard) return true;
            if (c.id === buriedCard.id) {
                removedBuriedCard = true;
                return false;
            }
            return true;
        });
    }

    out_cards = out_cards.sort((a, b) => 0.5 - Math.random());

    if (buriedCard) out_cards.push(buriedCard);


    let soberCard = undefined;

    if (playingWithDrunk) {
        var i = rng(0, out_cards?.length - 1);
        soberCard = out_cards[i];
        out_cards[i] = getCardFromId("p001");
    }



    return { cards: out_cards.map(c => c.id), soberCard: soberCard?.id };











    function getBuriedCard(cards) {








        const nonLinkedCards = cards.filter(c => {
            if (c.links?.length > 0) return false;

            let backup_exists = false;
            if (c?.backup_cards?.[0]) {
                for (let i = 0; i < c?.backup_cards?.length; i++) {
                    let backup = c?.backup_cards?.[i];
                    if (cards.filter(c => c?.id === backup)?.[0]) backup_exists = true;
                }
            } else backup_exists = true;

            if (!backup_exists) return false
            return true
        })




        const rn = rng(0, nonLinkedCards.length - 1);

        return nonLinkedCards[rn];
    }

}




export function getCardFromId(id) {
    let card = null;

    card = BlueCards.filter(c => c.id == id)[0] || null;
    if (!card) card = RedCards.filter(c => c.id == id)[0] || card;
    if (!card) card = YellowCards.filter(c => c.id == id)[0] || card;
    if (!card) card = GreyCards.filter(c => c.id == id)[0] || card;
    if (!card) card = GreenCards.filter(c => c.id == id)[0] || card;
    if (!card) card = PurpleCards.filter(c => c.id == id)[0] || card;
    if (!card) card = SpecialCards.filter(c => c.id == id)[0] || card;


    if (card) card = { ...card, color: getCardColorFromColorName(card?.color_name) };

    return card;
}





export function getCardColorFromId(id) {
    return CARD_COLORS[id[0] || "g"]
}

export function getCardColorFromColorName(color_name) {
    var color_nickname = CARD_COLOR_NAMES[color_name || "grey"] || "g";
    return CARD_COLORS[color_nickname]
}





export function getAllCards() {
    var all = [...BlueCards, ...RedCards, ...YellowCards, ...GreyCards, ...GreenCards, ...PurpleCards, ...SpecialCards];
    all = all.map(c => ({ ...c, color: getCardColorFromColorName(c?.color_name) }))
    return all;
}









export function getLinkedCards(card) {
    if (!card?.links) return []
    var lc = card?.links?.map(cid => getCardFromId(cid));
    var opposite = (["r", "b"].includes(card.id[0]) ? getCardFromId(`${(card.id[0] === "r" ? "b" : "r")}${card.id.slice(-3)}`) : null)
    if (opposite) lc = [opposite, ...lc]
    return lc;
}


export function getLinkedCardsPaired(card, sort = true) { // pairs everything up into one array
    var lc = getLinkedCards(card, sort)
    let arr = [card, ...lc];

    if (sort) {
        arr = arr.sort(function (a, b) {
            return a?.name === b?.name ? 0 : a?.name < b?.name ? -1 : 1;
        })
        for (let i = 0; i < CARD_COLOR_ORDER.length; i++) {
            let colorName = CARD_COLOR_ORDER[i];
            arr = arr.sort((x, y) => { return x.color_name === colorName ? 1 : y.color_name === colorName ? -1 : 0; });


        }
    }

    return arr;
}


export function getLinkedCardsPairedById(id, sort = true) { // pairs everything up into one array
    return getLinkedCardsPaired(getCardFromId(id), sort)
}