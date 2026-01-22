import {useMemo} from 'react';

function Countdown({ s, paused, onClick }) {




    const {m: minutes,s: seconds} = useMemo(() => convert(s), [s]);

    function convert(totalSeconds) {

        var h = Math.floor(totalSeconds / 3600);
        var m = Math.floor(totalSeconds / 60);
        var s = totalSeconds % 60;

        return { h, m, s }
    }

    return (
        <span onClick={onClick} style={{ transition: "all 1s cubic-bezier(1, 0, 0, 1)" }} className={' text-5xl delay-1000 p-2  pl-4 rounded-lg font-[1000] ' + (convert(s).m <= 0 ? "r text-primary opacity-90 " : "  ")}>

            {!paused ? <>
                <span className='countdown'>
                    <span data-lol={minutes} style={{ "--value": JSON.stringify(minutes) }}></span>
                </span>
                <span style={{ transition: "all 1s cubic-bezier(1, 0, 0, 1)" }} >:</span>
                <span className='countdown'>
                    <span style={{ "--value": seconds }}></span>
                </span>
            </>
                :
                <span className=' animate-pulse text-neutral'>
                    PAUSED
                </span>
            }
        </span>
    );
}

export default Countdown;