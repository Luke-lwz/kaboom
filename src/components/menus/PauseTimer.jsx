
function PauseTimer({paused, onPause, onEndRound}) {
    return (
        <div className="flex flex-col justify-center items-center text-center w-96 overflow-hidden bg-white rounded-lg p-4 gap-2">
            <h1 className="text-title text-lg w-full font-extrabold mb-2">Timer options</h1>
            <button onClick={onPause} className={"btn  w-full text-title font-extrabold " + (paused ? " btn-secondary " : " btn-primary ") }>{paused ? "resume" : "pause"}</button>
            <button onClick={onEndRound} className="btn btn-neutral w-full text-title font-extrabold">End Round</button>

        </div>
    );
}

export default PauseTimer;