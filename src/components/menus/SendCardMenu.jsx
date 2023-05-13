import PlayerList from "../PlayerList";


import { IoSend } from "react-icons/io5";

function SendCardMenu({ players, card, onClick, onCancel }) {
    return (
        <div className="flex flex-col justify-start items-center w-full overflow-hidden bg-white rounded-lg">
            <h1 className="text-title text-lg p-4 w-full font-extrabold">Swap cards with</h1>
            <div className="h-full w-full bg-neutral overflow-y-scroll scrollbar-hide overflow-hidden">
                <PlayerList onClick={onClick} players={players} element={<div className="flex flex-row-reverse justify-start items-center w-full h-full pr-2 ">
                    <div className="-rotate-45"><IoSend /></div>
                </div>} />
            </div>
        </div>
    );
}

export default SendCardMenu;