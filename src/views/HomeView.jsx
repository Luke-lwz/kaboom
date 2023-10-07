import { useContext, useState, useEffect, useMemo } from "react";

import { toast } from "react-hot-toast";

import { Peer } from "peerjs";
import { constructPeerID } from "../helpers/peerid";


// import { isIOS, isIOS13, isMacOs, isSafari, isMobileSafari } from "react-device-detect";



//context
import { PageContext } from "../components/PageContextProvider";


import { idGenAlphabet } from "../helpers/idgen";
import { useSearchParams } from "react-router-dom";
import LinkToTwoRoomsBox from "../components/LinkToTwoRoomsBox";
import BannerBoxWithImage, { NeutralBlankBannerBox } from "../components/BannerBoxWithImage";


//icons
import { BsBook } from "react-icons/bs";
import { HiUsers } from "react-icons/hi2";
import { HiOutlineExternalLink } from "react-icons/hi"
import { FaUser } from "react-icons/fa"


// avatar 
import Avatar, { genConfig } from 'react-nice-avatar-vite-prod-fork'
import Info from "../components/Info";
import { CardsRow } from "../components/playsets/PlaysetDisplay";
import { getCardFromId } from "../helpers/cards";
import ContributeLinks from "../components/ContributeLinks";
import { UserAvatar } from "../components/UserAvatars";
import supabase from "../supabase";



const isBeta = import.meta.env.VITE_BETA || false;


function HomeView({ }) {


    let [searchParams, setSearchParams] = useSearchParams();



    const { redirect, allLocalStorage, setPrompt, devMode, setDevMode, showLoginMenu, user, getUser, smoothNavigate } = useContext(PageContext)

    const [loading, setLoading] = useState(false);
    const [clicksToDev, setClicksToDev] = useState(0);

    const [lastGame, setLastGame] = useState(getLastGame());
    const [lastPlayer, setLastPlayer] = useState(null);


    const [displayUseSafari, setDisplayUseSafari] = useState(false)


    const testPeer = new Peer();

    const joinPeer = new Peer();
    const createPeer = new Peer();




    useEffect(() => {


        // // safari

        // const isSafariLocal = JSON.parse(localStorage.getItem("issafari"));

        // console.log(isSafariLocal)
        // if (isSafariLocal) {
        //     setDisplayUseSafari(true);
        // } else if (isSafariLocal === false) {

        // } else {
        //     if ((isIOS || isIOS13 || isMacOs) && (!(isSafari && isMobileSafari))) {
        //         setDisplayUseSafari(true);
        //         localStorage.setItem("issafari", "true")
        //     } else {
        //         localStorage.setItem("issafari", "false")

        //     }
        // }





        setTimeout(() => getLastPlayer(), 250)

        setInterval(() => getLastPlayer(), 5 * 1000)






        // join Room based on query in url

        const c = searchParams.get("c");
        if (c) {
            setTimeout(() => {

                document.getElementById("room-input").value = c.toUpperCase();

                setTimeout(() => {

                    document.getElementById("join_btn").click();
                }, 500)
            }, 500)
        }



        // dev mode toggle
        const dev = searchParams.get("dev");
        if (dev?.length) {
            localStorage.setItem("devmode", dev);
            setDevMode(JSON.parse(dev));
            setTimeout(() => redirect("/"), 100);
        }



    }, [])



    function getLastGame() {
        const all = allLocalStorage();



        // last Game
        const lastGame = all.filter(a => a.key.startsWith("game-") && a.value !== "{}")[0];
        if (lastGame) var lastGameCode = lastGame.key.split("-")[1];
        if (lastGameCode) var lastGamePlayer = all.filter(a => a.key === `player-${lastGameCode}`)[0];
        if (lastGamePlayer?.value) var player = JSON.parse(lastGamePlayer?.value)
        if (lastGame && lastGameCode && player) return { code: lastGameCode, player, game: JSON.parse(lastGame.value), avaConfig: genConfig(player.name || player.id) }


    }

    function getLastPlayer() {


        const all = allLocalStorage();

        // last player
        const lastPlayer = all.filter(a => a.key.startsWith("player-") && JSON.parse(a.value)?.id?.toUpperCase() !== "HOST")[0];
        if (lastPlayer) tryToConnect(lastPlayer.key.split("-")[1], JSON.parse(lastPlayer.value));

        function tryToConnect(code, player) {
            const connToRoom = testPeer.connect(constructPeerID(code, "host"));
            connToRoom.on("open", () => {
                setLastPlayer({ code, player, avaConfig: genConfig(player.name || player.id) })
                connToRoom.close();
            })

            connToRoom.on("error", () => { conn.close(); setLastPlayer(null) })

            joinPeer.on("error", () => setLastPlayer(null))



        };
    }




    function joinRoom() {
        const code = document?.getElementById("room-input")?.value?.toUpperCase() || null;


        if (!code) return toast.error("No code provided")
        if (code.length < 4) return toast.error("Code must be 4 letters");


        const playerData = JSON.parse(localStorage.getItem(`player-${code}`))

        if (localStorage.getItem(`game-${code}`)) return redirect(`/game/${code}`)
        if (playerData?.name) return redirect(`/lobby/${code}`)




        const connToRoom = joinPeer.connect(constructPeerID(code, "host"));
        setLoading(true);
        connToRoom?.on("open", () => {
            setPrompt({ element: <NamePrompt onEnter={setNameAndJoin} buttonValue="JOIN" /> })

            setLoading(false)
            connToRoom.close();
        })


        joinPeer.on("error", (err) => {
            toast.error("Error");
            setPrompt(null);
            setLoading(false)
        })





        function setNameAndJoin(name) {
            if (name === "") return setPrompt(null);



            // remove all other player-{code} from localStorage
            const all = allLocalStorage();
            for (let i = 0; i < all.length; i++) {
                const element = all[i];
                if (element.key.startsWith("player-")) {
                    const player = JSON.parse(element.value);
                    if (player?.id !== "HOST") localStorage.removeItem(element.key)

                }
            }




            localStorage.setItem(`player-${code}`, JSON.stringify({
                name,
                id: playerData?.id
            }));

            setPrompt(null);

            redirect(`/lobby/${code}`, { replace: true });


        }



    }

    function createRoom() {



        setPrompt({ element: <NamePrompt onEnter={setNameAndCreate} buttonValue="CREATE" /> })


        function setNameAndCreate(name) {
            if (name === "") return setPrompt(null);

            const code = idGenAlphabet();



            const connToRoom = createPeer.connect(constructPeerID(code, "board"));
            setLoading(true);
            connToRoom.on("open", () => {
                toast.error("Error");
                setPrompt(null);
                connToRoom.close();
            })


            createPeer.on("error", (err) => {

                // removes all host-{code} from localStorage
                const all = allLocalStorage();
                for (let i = 0; i < all.length; i++) {
                    const element = all[i];
                    if (element.key.startsWith("game-")) {
                        localStorage.removeItem(element.key)
                        // remove host player info
                        const code = element.key.split("-")[1];
                        localStorage.removeItem(`player-${code?.toUpperCase()}`)

                    }


                }


                localStorage.setItem(`game-${code}`, "{}");
                localStorage.setItem(`player-${code}`, JSON.stringify({
                    name,
                    id: "HOST"
                }));
                setPrompt(null);
                redirect(`/lobby/${code}`, { replace: true });
            })

        }


    }



    function clickDev() {
        if (!devMode) {
            if (clicksToDev >= 6) {
                setDevMode(true);
                localStorage.setItem("devmode", "true")
                setClicksToDev(0);
            } else {
                setClicksToDev(clicksToDev + 1);
            }
        }
    }


    async function logout() {
        try {
            const { error } = await supabase.auth.signOut()
            console.log(error)
        } catch (e) {

        }
        window.location.href = "/"
    }


    async function supatest() {
        const { data, error } = await supabase.auth.updateUser({ data: { kaboom: { name: "lukas" } } })
        console.log(data)

        getUser();
    }




    return (
        <div className="flex flex-col justify-start items-center scrollbar-hide h-full w-full gap-4 overflow-y-scroll pb-24">

            {displayUseSafari && <a href={`x-web-search://?playkaboom.com`} className="bg-info/80 text-info-content py-2 -mb-4 w-full gap-4  text-center font-extrabold text-2xl grid grid-cols-8  px-2">
                <div className="w-8 h-8 "><img src="/safari.png" className="h-full w-full object-cover" alt="" /></div><div className="truncate col-span-6">Use safari for a better experience</div><div className="flex items-center justify-center"><HiOutlineExternalLink /></div>
            </a>}

            {devMode && <DevModeBanner />}
            <div className="text-title font-bold text-3xl sm:text-4xl md:text-6xl my-4 pt-4 text-primary relative w-full flex items-center justify-center">
                <div className="flex flex-col items-center relative" onClick={clickDev}>
                    KABOOM
                    <span className="text-neutral text-normal text-xs font-light">Adaptation of Two Rooms and a Boom&trade;</span>
                    {isBeta && <div className="absolute text-sm md:text-base text-secondary-content bg-secondary rounded-lg px-3 md:px-4 py-1.5 md:py-2 -rotate-12 right-2 sm:right-0 md:-right-4 bottom-0 animate-pulse">
                        BETA
                    </div>}
                </div>


                {/* Login */}
                <div className="top-0 right-0 p-4 pt-0 text-2xl md:text-3xl flex items-center justify-center absolute clickable">
                    {!user?.id ?
                        <FaUser onClick={() => showLoginMenu()} />
                        :
                        <div className="dropdown dropdown-end" >
                            <label tabIndex={0} className="rounded-full"><UserAvatar user={user} /></label>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 text-base font-normal text-base-content text-normal">
                                <li><button onClick={() => smoothNavigate(`/users/${user?.id}`)}>Profile</button></li>
                                <li><button onClick={() => logout()}>Logout</button></li>
                            </ul>
                        </div>
                    }
                </div>

            </div>





            {lastGame && <NeutralBlankBannerBox onClick={() => redirect("/game/" + lastGame.code)}>
                <div className="h-full w-full flex flex-col text-title p-1 font-extrabold">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">RECENT GAME: <span className="text-secondary">{lastGame.code}</span><span className="text-normal"><Info tooltip="The last game you hosted. Click to re-enter and play or close." /></span></div>
                        {lastGame.game?.players && <div className="flex items-center gap-1 text-primary">
                            {lastGame.game?.players?.length} <HiUsers size={22} />
                        </div>}
                    </div>
                    <div className="flex py-4 gap-6 px-2.5 text-normal overflow-hidden overflow-x-scroll scrollbar-hide">

                        <CardsRow cards={lastGame?.game?.game?.cardsInGame?.map(c => getCardFromId(c)) || []} />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className=" h-6 w-6">
                            <Avatar className="w-full h-full" {...lastGame.avaConfig} />
                        </div>
                        <p className="text-normal font-bold">{lastGame?.player?.name}</p>
                    </div>

                </div>
            </NeutralBlankBannerBox>}



            {lastPlayer && <NeutralBlankBannerBox onClick={() => redirect("/game/" + lastPlayer.code)}>
                <div className="w-full h-full  flex justify-start items-center">
                    <div className=" h-16 w-16">
                        <Avatar className="w-full h-full border-2 border-base-100" {...lastPlayer.avaConfig} />
                    </div>
                    <div className="grow h-full flex flex-col items-start justify-center px-3 text-title font-extrabold">
                        <div className="flex gap-1.5 items-center">REJOIN <span className="text-secondary">{lastPlayer.code}</span><span className="text-normal"><Info tooltip="The last game you joined is still live. Click to join again." /></span></div>
                        <h1 className="text-normal ">{lastPlayer.player.name}</h1>
                    </div>
                </div>
            </NeutralBlankBannerBox>}


            <div className="flex w-full flex-col items-center gap-8 scrollbar-hide">
                <Box>
                    <h1 className="text-2xl">Join Room</h1>
                    <input autoComplete="off" id="room-input" type="text" max={4} maxLength={4} className="input skew-reverse text-center font-extrabold text-xl text-normal tracking-widest text-black w-fit px-0 bg-accent-content" placeholder="&#x2022; &#x2022; &#x2022; &#x2022;" onChange={(e) => (e?.target?.value?.length <= 4 ? e.target.value = e.target.value.toUpperCase() : e.target.value = e.target.value.substring(0, 4))} />
                    <button id="join_btn" className={"btn transition-all bg-secondary " + (loading ? " text-primary-content btn-wide opacity-75 " : " btn-secondary opacity-100 btn-wide ")} onClick={() => joinRoom()}>JOIN</button>
                    <div className="mx-12 max-w-sm my-2.5 py-[0.05rem] bg-neutral-content w-full rounded-full"></div>
                    <button type="button" className={"btn transition-all bg-primary " + (loading ? " bg-primary text-primary-content btn-wide " : " btn-primary opacity-100 btn-wide ")} onClick={() => createRoom()}>CREATE ROOM</button>

                </Box>
            </div>


            <LinkToTwoRoomsBox />


            <div onClick={() => smoothNavigate("/cards")} className="w-full">
                <BannerBoxWithImage noTarget src="cards_image.png">
                    <h1 className='font-extrabold text-lg'>Check out the cards!</h1>
                </BannerBoxWithImage>
            </div>


            <div className="w-full flex justify-center items-center">
                <a href="TwoRooms_Rulebook_v3.pdf" target="_blank" className=' w-full max-w-2xl mx-4 clickable flex justify-center items-center text-title bg-neutral text-neutral-content rounded-lg p-2.5 gap-3'>
                    <div className='scale-110'>
                        <BsBook />
                    </div>
                    <h1 className='hi'>Rulebook</h1>
                </a>
            </div>


            <ContributeLinks />

            <div className="flex justify-center w-full items-center text-xs text-gray-500 py-4"><div className="text-center">This work is <a className="underline" href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode" target="_blank">licensed</a> under the<br /><a className="underline" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">Creative Commons license BY-NC-SA 4.0.</a><br /><a href="/privacy" target="_blank" className="underline">Privacy</a></div></div>
        </div>
    );
}



function Box({ children }) {
    return (
        <div className="h-80 w-full flex flex-col justify-around items-center p-4 text-cowboys rounded-none bg-neutral text-neutral-content">
            {children}
        </div>
    )
}




function NamePrompt({ onEnter, buttonValue }) {
    const { setPrompt } = useContext(PageContext);

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");


    const avaConfig = useMemo(() => {
        return genConfig(name);
    }, [name])

    function click() {
        const name = document?.getElementById("name-input-element")?.value;
        if (name === "") return
        setLoading(true);
        onEnter(name);
    }


    return (
        <div className="w-full flex flex-col justify-start items-center gap-4">

            {name && name != "" ? <Avatar style={{ height: "3rem", width: "3rem" }} {...avaConfig} /> : <h1 className="text-title text-2xl font-extrabold h-12 flex items-center">Name</h1>}
            <input autoFocus={true} id="name-input-element" type="text" placeholder="Real name" className="skew input text-center font-extrabold text-xl text-normal text-accent-content w-fit px-0 bg-neutral " onChange={(e) => { e.target.value = e.target.value.trimStart(); setName(e.target.value.trimStart()) }} />
            <div className="flex justify-end items-center w-full gap-1">
                <button onClick={() => setPrompt(null)} className={"btn  text-title scale-50 " + (loading ? " hidden " : " btn-ghost ")}>CANCEL</button>
                <button className={"btn text-title scale-50 " + (loading ? " loading btn-disabled " : " btn-primary ")} onClick={() => click()} >{buttonValue}</button>
            </div>
        </div>
    )
}



export function DevModeBanner() {
    return (<div className="w-full p-3 bg-warning/30 border-warning text-warning-content font-bold flex justify-between items-center text-xl text-title pl-5 "><h1>Development Mode</h1><a className="btn-warning clickable p-2 px-3 rounded-lg text-normal text-base font-bold" href="/?dev=false">Turn off</a></div>)
}

export default HomeView;