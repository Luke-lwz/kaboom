import { useMemo, useState } from "react";

import { AiOutlinePlus, AiOutlineInfoCircle } from "react-icons/ai";


import { getPlaysetArea } from "../../helpers/playset-areas";




export function WorkbenchPlaysetArea({ areaId, children, onAdd = () => { }, hideAddButton = false, infoText }) {
    const [area, setArea] = useState(getPlaysetArea(areaId || "odd"));
    return (
        <div style={{ backgroundColor: area?.colors?.bg }} className="flex flex-col items-start justify-start p-4 rounded-lg w-full">
            <div style={{ color: area?.colors?.primary }} className="font-extrabold text-lg flex items-center gap-2 -mt-1 mb-1">
                <area.icon />
                <p>{area?.name}</p>
                {area?.info && <div className={"tooltip normal-case font-normal tooltip-bottom"} data-tip={area.info}>
                    <AiOutlineInfoCircle color={area?.colors?.primary} />
                </div>}
            </div>
            {infoText && <p className=" cursor-default text-base-content mb-1 -mt-1 font-semibold">{infoText}</p>}
            <div className="w-full flex flex-col items-start justify-start gap-4">
                {children}
                {!hideAddButton ? <div onClick={() => { onAdd }} style={{ borderColor: area?.colors?.primary, color: area?.colors?.primary }} className=" border-2 border-dashed px-4 py-2 rounded-lg clickable text-sm font-bold flex items-center justify-center gap-2">
                    <AiOutlinePlus /><p>CARDS</p>
                </div> : <></>}
            </div>

        </div>
    )
}