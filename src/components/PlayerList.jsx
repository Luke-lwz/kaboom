import { useEffect, useMemo } from "react";

// avatar 
import Avatar, { genConfig } from 'react-nice-avatar-vite-prod-fork'

function PlayerList({ players = [], onClick, element, showOnline, showId, me }) {


    return (
        <div className="w-full p-3 flex flex-col justify-start items-center gap-3">
            {players?.map((player, i) => <PlayerRow key={i} element={element} me={me} {...player} onClick={onClick} showId={showId} showOnline={showOnline} />)}
        </div>
    );
}


export function PlayerRow({ name, id, onClick, element, conn, me, showId, showOnline, ready }) {

    const avaConfig = useMemo(() => {
        return genConfig(name || id || "a");
    }, [name, id])

    return (
        <div onClick={onClick ? () => onClick(id) : () => { }} className={'bg-base-100 text-base-content overflow-hidden rounded-md h-12 skew p-2 pl-6 text-title font-extrabold text-sm w-full flex justify-between items-center' + (onClick ? " clickable " : "")}>
            <div className='flex items-center gap-2 w-full'>
                <Avatar shape="square" className='skew' style={{ height: "3rem", width: "3rem", borderRadius: "0px", marginLeft: "-1.55rem", marginRight: "0.25rem" }} {...avaConfig} />
                <h1 className="font-extrabold truncate">{name}</h1>
                <div className="grow flex items-center justify-start gap-2">
                    {showOnline && <OnlineStatus online={conn || id === "HOST"} />}
                    {showId && <div className={'label w-fit flex items-center justify-center label-primary text-primary-content rounded-md px-2 py-1 text-xs text-normal skew ' + (id === "HOST" ? " bg-secondary " : " bg-primary ")}>{id}</div>}
                    {me && me?.id === id && <div className={'label w-fit flex items-center justify-center label-primary text-primary-content rounded-md px-2 py-1 text-xs text-normal skew bg-info '}>YOU</div>}
                    {ready && <div className='label flex items-center justify-center label-secondary bg-success text-secondary-content rounded-md px-2 py-1 text-xs text-normal skew'>READY</div>}
                    {element}
                </div>
            </div>
        </div>
    )
}


function OnlineStatus({ online = false }) {
    return (
        <div className={"rounded-full h-2.5 w-2.5 mx-3 " + (online ? " bg-success " : " bg-base-300 ")} />
    )
}

export default PlayerList;