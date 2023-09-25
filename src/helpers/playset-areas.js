
import { LuSwords } from "react-icons/lu"
import { TbCards } from "react-icons/tb"
import { PiCirclesThreeBold } from "react-icons/pi"
import {BsFiles} from "react-icons/bs"

const PLAYSET_AREAS = {
    primaries: {
        colors: {
            primary: "#ec1f2b",
            bg: "#ec1f2b15"
        },
        name: "Primaries",
        info: "Everything revolves around the primary cards (eg. the President or Bomber)",
        icon: LuSwords
    },
    general: {
        colors: {
            primary: "#4f94ff",
            bg: "#4f94ff15"
        },
        name: "General cards",
        info: "General cards are distributed among players and define their alliances/win-objectives and sometimes even give them roles and special powers.",
        icon: TbCards
    },
    odd: {
        colors: {
            primary: "#9e9e9e",
            bg: "#9e9e9e15"
        },
        name: "Odd card",
        info: "Odd cards are shuffled in when primary and general cards leave one player empty handed. (eg. if 6 cards in playset but 7 players)",
        icon: PiCirclesThreeBold
    },
    default: {
        colors: {
            primary: "#f97316",
            bg: "#f9731615"
        },
        name: "Default cards",
        info: "Default cards are dealt when all other cards have been given to players. They are dealt until no player is empty handed.",
        icon: BsFiles
    }
}



export function getPlaysetArea(areaId) {
    return PLAYSET_AREAS[areaId] || null;
}