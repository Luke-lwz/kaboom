
import { FaFlagCheckered, FaForward, FaPause, FaPlay } from "react-icons/fa";
import MegaButton from "../MegaButtons";
import RoundConfig from "../RoundConfig";


function RoundInfoMenu({ game, paused, onPause, onEndRound, onEndGame }) {
    return (
        <div className=" w-full flex flex-col justify-center items-center text-center max-w-[24rem] overflow-hidden bg-white text-black rounded-3xl">
            {onPause && onEndRound && onEndGame ? <div className="w-full p-4 gap-2 bg-blue-800 text-white box-shadow-xl">
                <h1 className="text-title text-lg w-full font-extrabold mb-2">Timer options</h1>
                <div className="flex items-center justify-center gap-2 w-full">
                    <MegaButton onClick={onPause} fill textColor={"#031759"}>
                        {paused ? <FaPlay /> : <FaPause />}
                    </MegaButton>
                    <MegaButton onClick={onEndRound} fill textColor={"#031759"}>
                        <FaForward />
                    </MegaButton>
                    <MegaButton onClick={onEndGame} fill textColor={"#031759"}>
                        <FaFlagCheckered />
                    </MegaButton>
                </div>
            </div>
                :
                <div className="w-full p-4 gap-2 bg-blue-800 text-white box-shadow-xl">
                <h1 className="text-title text-lg w-full font-extrabold">Round info</h1>

                </div>}

            <div className="p-4 w-full h-fit max-h-96 overflow-y-scroll scrollbar-hide overflow-x-hidden">
                <RoundConfig
                    color={"#031759"}
                    roundConfig={game?.rounds}
                    highlightRound={game?.round}
                />
            </div>





            <div className="w-[50rem]"></div>
        </div>
    );
}

export default RoundInfoMenu;