import BlueCards from "../config/cards/blue.json";
import RedCards from "../config/cards/red.json";
import GreyCards from "../config/cards/grey.json";
import GreenCards from "../config/cards/green.json";
import PurpleCards from "../config/cards/purple.json";
import BlackCards from "../config/cards/black.json";



// icons
import { FaBomb, FaTheaterMasks } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { GiBrain, GiBottleCap } from "react-icons/gi";
import { MdDarkMode } from "react-icons/md"
import { getPlaysetById } from "./playsets";
import { rng } from "./idgen";


export const CARD_COLOR_NAMES = {
    red: "r",
    blue: "b",
    grey: "g",
    green: "e",
    purple: "p",
    dark: "d"
    
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
    }
}


export function getCardsForPlayset(game_data) {

    var { players, playsetId, playWithBury } = game_data;

    const playset = getPlaysetById(playsetId);


    var { cards, odd_card, shuffle } = playset;

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
                else cards = [...cards, getCardFromId(["b000", "r000"][rng(0, 1)])];
            } else {
                cards.push(getCardFromId((i % 2 === rngSeed ? "b000" : "r000")));
            }
        }
    } else {
        if (playWithBury && odd_card) cards.push(odd_card);
        else if (length % 2 === 1 && odd_card) cards.unshift(odd_card);
    }




    if (shuffle) { // shuffles in pairs
        var shuffled_cards = [...cards.sort((a, b) => 0.5 - Math.random())];


        shuffled_cards = shuffled_cards.sort((x, y) => { return x.id == "r001" ? -1 : y.id == "r001" ? 1 : 0; });
        shuffled_cards = shuffled_cards.sort((x, y) => { return x.id == "b001" ? -1 : y.id == "b001" ? 1 : 0; });

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

            let secondary_exists = false;
            if (c?.secondaries?.[0]) {
                for (let i = 0; i < c?.secondaries?.length; i++) {
                    let secondary = c?.secondaries?.[i];
                    if (cards.filter(c => c?.id === secondary)?.[0]) secondary_exists = true;
                }
            } else secondary_exists = true;

            if (!secondary_exists) return false
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
    if (!card) card = GreyCards.filter(c => c.id == id)[0] || card;
    if (!card) card = GreenCards.filter(c => c.id == id)[0] || card;
    if (!card) card = PurpleCards.filter(c => c.id == id)[0] || card;
    if (!card) card = BlackCards.filter(c => c.id == id)[0] || card;


    if (card) card = { ...card, color: getCardColorFromColorName(card?.color_name) };

    return card;
}





export function getCardColorFromId(id) {
    return CARD_COLORS[id[0] || "g"]
}

export function getCardColorFromColorName(color_name) {
    var color_nickname = CARD_COLOR_NAMES[color_name || "grey"] || "g";
    return CARD_COLORS[color_nickname ]
}





export function getAllCards() {
    var all = [...BlueCards, ...RedCards, ...GreyCards, ...GreenCards, ...PurpleCards, ...BlackCards];
    all = all.map(c => ({ ...c, color: getCardColorFromColorName(c?.color_name) }))
    return all;
}









export function getLinkedCards(card) {
    var lc = card.links.map(cid => getCardFromId(cid));
    var opposite = (["r", "b"].includes(card.id[0]) ? getCardFromId(`${(card.id[0] === "r" ? "b" : "r")}${card.id.slice(-3)}`) : null)
    if (opposite) lc = [opposite, ...lc]
    return lc;
}