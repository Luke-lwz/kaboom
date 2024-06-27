import { useContext, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PageContext } from "../components/PageContextProvider";
import Info from "../components/Info";


function RejoinView({ }) {

    const { code } = useParams();

    const { redirect, setPrompt } = useContext(PageContext);

    let [searchParams, setSearchParams] = useSearchParams();

    const [manualInput, setManualInput] = useState(false);

    useEffect(() => {
        setPrompt(null);
        testForManual();
    }, [])


    function testForManual() {
        if (!code) return
        if (localStorage.getItem(`game-${code}`) && JSON.parse(localStorage.getItem(`game-${code}`))?.game) return redirect(`/game/${code}`)
        const player = JSON.parse(localStorage.getItem(`player-${code}`));
        // if (!player?.name) {
        //     redirect(`/?c=${code}`)
        //     localStorage.removeItem(`player-${code}`);
        //     return
        // }
        const m = searchParams.get("m"); // m stands for manual input
        if (m) return setManualInput(true);
        if (!player?.id) return setManualInput(true);
        return redirect(`/game/${code}`)
    }



    function rejoin() {
        const id = document?.getElementById("id-input")?.value?.toUpperCase() || null;

        if (!id) return


        localStorage.setItem(`player-${code}`, JSON.stringify({ id }));

        redirect(`/game/${code}`);

    }

    return (!manualInput ?
        <button className="loading loading-spinner"></button>
        :
        <div>
            <h1 className="text-title w-full text-center p-4 text-primary text-2xl font-extrabold">KABOOM</h1>
            <div className="w-full p-4 bg-neutral flex flex-col items-center gap-4 text-title">
                <h1 className="text-xl text-neutral-content font-extrabold">3 letter player id</h1>
                <input autoComplete="off" id="id-input" type="text" max={3} maxLength={3} className="input skew-reverse text-center font-extrabold text-xl text-normal tracking-widest text-black w-fit px-0 bg-accent-content" placeholder="&#x2022; &#x2022; &#x2022;" onChange={(e) => (e?.target?.value?.length <= 4 ? e.target.value = e.target.value.toUpperCase() : e.target.value = e.target.value.substring(0, 4))} />
                <button id="join_btn" className={"btn btn-wide transition-all bg-secondary "} onClick={() => rejoin()}>Rejoin room</button>

            </div>
            <a className='link font-bold clickable w-full flex items-center justify-center mt-2 -mb-2' href="/">Leave</a>

            <div className="p-4 rounded-lg m-4 bg-info/30 text-info-content bold-child-info">
                Your <b>3 LETTER ID</b> can be found by pressing the <Info /> <b>button</b> on your friends screen. <br />(The ID will be next to your username)
            </div>
        </div>
    );
}

export default RejoinView;
