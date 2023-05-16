
function PauseTimer({paused, onPause, onEndRound, onEndGame}) {
    return (
        <div className=" w-full flex flex-col justify-center items-center text-center max-w-[24rem] overflow-hidden bg-white rounded-lg p-4 gap-2">
            <h1 className="text-title text-lg w-full font-extrabold mb-2">Timer options</h1>
            <button onClick={onPause} className={"btn  w-full text-title font-extrabold " + (paused ? " btn-secondary " : " btn-primary ") }>{paused ? "resume" : "pause"}</button>
            <button onClick={onEndRound} className="btn btn-neutral w-full text-title font-extrabold">End Round</button>
            <button onClick={onEndGame} className="btn btn-ghost text-error-content w-full text-title font-extrabold">End Game</button>
            <div className="w-[50rem]"></div>
        
        </div>
    );
}

export default PauseTimer;