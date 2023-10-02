import { useMemo, useState } from "react";

import { AiOutlinePlus, AiOutlineInfoCircle } from "react-icons/ai";


import { getPlaysetArea } from "../../helpers/playset-areas";




export function WorkbenchPlaysetArea({ areaId, children, onAdd = () => { }, hideAddButton = false, infoText, min, max, cardCount }) {
    const area = useMemo(() => getPlaysetArea(areaId || "odd"), areaId);

    const ableToAdd = useMemo(() => {
        return (cardCount < max);
    }, [min, max, cardCount])
    return (
        <div style={{ backgroundColor: area?.colors?.bg }} className="flex flex-col items-start justify-start p-4 gap-2 rounded-lg w-full">
            <div style={{ color: area?.colors?.primary }} className="font-extrabold text-lg flex items-center gap-2 -mt-1 mb-1">
                <area.icon />
                <p>{area?.name}</p>
                {area?.info && <div className={"tooltip normal-case font-normal tooltip-bottom"} data-tip={area.info}>
                    <AiOutlineInfoCircle color={area?.colors?.primary} />
                </div>}
            </div>
            {infoText && <p className=" cursor-default text-base-content mb-1 -mt-3 font-normal">{infoText}</p>}
            {cardCount >= max && <p className=" text-xs cursor-default text-base-content mb-1 -mt-3 font-normal">Maximum of {max} card{max > 1 ? "s" : ""} in this category reached!</p>}
            {cardCount < min && <p className=" text-xs cursor-default text-error mb-1 -mt-3 font-normal">This category needs to have at least {min} card{min > 1 ? "s" : ""} </p>}
            <div className="w-full flex flex-col items-start justify-start gap-4">
                {children}
                {ableToAdd && !hideAddButton ? <div onClick={onAdd} style={{ borderColor: area?.colors?.primary, color: area?.colors?.primary }} className=" border-2 border-dashed px-4 py-2 rounded-lg clickable text-sm font-bold flex items-center justify-center gap-2">
                    <AiOutlinePlus /><p>CARDS</p>
                </div> : <></>}
            </div>

        </div>
    )
}


export function PlaysetDisplayArea({areaId, children}) {
    const area = useMemo(() => getPlaysetArea(areaId || "odd") || getPlaysetArea("odd"), [areaId]);

    return (
        <div style={{ backgroundColor: area?.colors?.bg }} className="p-4 pl-10 rounded-md w-fit pr-6 flex items-center gap-6 relative">
            <div className="absolute flex-col flex">
                <area.icon />
            </div>
            {children}
        </div>
    )
}