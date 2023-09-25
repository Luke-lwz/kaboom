
import { LuSwords } from "react-icons/lu"

const PLAYSET_AREAS = {
    primaries: {
        colors: {
            primary: "#ec1f2b",
            bg: "#ec1f2b15"
        },
        name: "Primaries",
        icon: LuSwords
    }
}



export function getPlaysetArea(areaId) {
    return PLAYSET_AREAS[areaId] || null;
}