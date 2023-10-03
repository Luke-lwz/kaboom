
import { LuSwords } from "react-icons/lu"
import { TbCards } from "react-icons/tb"
import { PiCirclesThreeBold } from "react-icons/pi"
import {BsFiles} from "react-icons/bs"

const PLAYSET_AREAS = {
    primaries: {
        colors: {
            primary: "#ec1f2b",
            bg: "#ec1f2b20"
        },
        name: "Primaries",
        info: "Everything revolves around the primary cards (eg. the President or Bomber)",
        icon: LuSwords
    },
    general: {
        colors: {
            primary: "#4f94ff",
            bg: "#4f94ff20"
        },
        name: "General cards",
        info: "General cards are distributed among players and define their alliances/win-objectives and sometimes even give them roles and special powers.",
        icon: TbCards
    },
    odd: {
        colors: {
            primary: "#595959",
            bg: "#59595920"
        },
        name: "Odd card",
        info: "The odd card is shuffled in when primary and general cards leave one player empty handed. (eg. if 6 cards in playset but 7 players)",
        icon: PiCirclesThreeBold
    },
    default: {
        colors: {
            primary: "#13d420",
            bg: "#13d42020"
        },
        name: "Default cards",
        info: "Default cards are dealt when all other cards have been given to players. They are dealt until no player is empty handed.",
        icon: BsFiles
    }
}



export function getPlaysetArea(areaId) {
    return PLAYSET_AREAS[areaId] || null;
}