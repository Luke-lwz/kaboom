import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContext } from '../components/PageContextProvider';


import moment from 'moment/moment';


import Peer from 'peerjs';

// helpers
import { constructPeerID } from '../helpers/peerid';
import { idGenAlphabet } from '../helpers/idgen';
import { getPlaysetById, getPlaysetsWithCards } from '../helpers/playsets';


// icons 
import { IoPersonRemoveSharp } from "react-icons/io5"
import { HiQrCode, HiUsers } from "react-icons/hi2"


//components
import PlaysetDisplay, { PlayWithBuryToggle, WrongPlayerNumberPlayset } from '../components/playsets/PlaysetDisplay';
import ChoosePlaysetMenu, { calculatePlaysetDisabled } from '../components/menus/ChoosePlaysetMenu';
import QRCodeMenu from '../components/menus/QRCodeMenu';
import Info from '../components/Info';
import { PlayerRow } from "../components/PlayerList"



// avatar 
import Avatar, { genConfig } from 'react-nice-avatar-vite-prod-fork'




function LobbyView(props) {


    const [loading, setLoading] = useState(true);
    const [host, setHost] = useState(false);
    const [me, setMe] = useState(null);

    const { redirect, setMenu } = useContext(PageContext);

    const { code } = useParams();

    useEffect(() => {
        if (!code) return redirect("/");
        if (localStorage.getItem(`game-${code}`)) setHost(true);
        const me = JSON.parse(localStorage.getItem(`player-${code}`));
        if (!me?.name) {
            setTimeout(() => redirect("/?c=" + code), 100); // redirects to join home
            return
        }

        setMe(me);
        setLoading(false);
    }, [code])



    function openQRCode() {
        setMenu(
            <QRCodeMenu href={window?.location?.href} code={code} />
        )
    }



    return (
        <div className='flex flex-col justify-start items-center w-full h-full overflow-hidden'>
            <div className='absolute top-3 right-3 p-3 text-3xl' onClick={openQRCode}><HiQrCode /></div>
            <div className='flex flex-col justify-start items-center text-title p-4 w-full'>
                <h2 className='text-primary text-lg'>KABOOM</h2>
                <h1 className='text-secondary text-4xl skew font-extrabold'>{code}</h1>
            </div>
            <div className='overflow-y-scroll overflow-x-hidden w-full scrollbar-hide flex flex-col items-center' >
                {loading ? <div className='loading' /> : host ? <HostLobby me={me} code={code} /> : <ClientLobby me={me} setMe={setMe} code={code} />}
            </div>
        </div>);
}


function ClientLobby({ me, setMe, code }) {

    const { connectionErrorPrompt, redirect, setPrompt } = useContext(PageContext);

    const [loading, setLoading] = useState(true);

    const [ready, setReady] = useState(false);
    const [playerList, setPlayerList] = useState([]);
    const [playset, setPlayset] = useState(getPlaysetById("t0001"))

    const [conn, setConn] = useState(null);


    const player_data = JSON.parse(localStorage.getItem("player-" + code));


    useEffect(() => {
        startPeer();

    }, [])


    useEffect(() => {
        if (conn) {
            const player_data = JSON.parse(localStorage.getItem("player-" + code));
            if (ready) conn.send({ intent: "ready", payload: { ...player_data } })
            if (!ready) conn.send({ intent: "unready", payload: { ...player_data } })

        }
    }, [ready])


    function startPeer() {
        const peer = new Peer();

        peer.on("open", () => {
            var conn = peer.connect(constructPeerID(code, "host"));

            conn.on("open", () => {
                conn.send({ intent: "join", payload: { name: player_data.name, id: player_data?.id } })
                setConn(conn);
            })


            conn.on("data", data => {
                switch (data?.intent) {
                    case "player_list": // also carries playset
                        setPlayerList(data?.payload?.players || [])
                        setPlayset(getPlaysetById(data?.payload?.playsetId) || getPlaysetById("t0001"));
                        break;
                    case "joined_lobby":
                        setPlayerList(data?.payload?.players || [])
                        let newMe = { ...player_data, id: data?.payload?.myId }
                        localStorage.setItem("player-" + code, JSON.stringify(newMe))
                        setMe(newMe)
                        setLoading(false)
                        break;
                    case "redirect":
                        if (data?.payload?.to) {
                            setTimeout(() => {
                                setPrompt(null)
                            }, 300)
                            setTimeout(() => {
                                conn.close();
                                peer.destroy();
                                redirect(data?.payload?.to)

                            }, 1000)

                        }
                        break;
                }
            })


            conn.on("error", () => connectionErrorPrompt())

            conn.on("close", () => connectionErrorPrompt())
        })



        peer.on("error", () => connectionErrorPrompt())

        peer.on("disconnected", (err) => {
            connectionErrorPrompt(true)
        })


    }


    function changeName() {
        localStorage.setItem(`player-${code}`, JSON.stringify({ id: me?.id }))
        redirect(`/?c=${code}`);
    }



    return (!loading ?
        <div className='flex flex-col justify-start items-center w-full'>

            <Lobby me={me} players={playerList} />
            <div className='w-full max-w-2xl p-4 gap-2 flex flex-col justify-start items-center'>
                <button className={'w-full btn text-title text-primary-content' + (ready ? " btn-success " : " btn-accent ")} onClick={() => setReady(!ready)}>{ready ? "Ready!" : "Ready up!"}</button>
                <button className={'w-full btn text-title btn-ghost text-neutral'} onClick={() => changeName()}>change name</button>
                <button className='link font-bold clickable' onClick={() => { conn?.send({ intent: "leave", payload: { id: me?.id } }); redirect("/") }}>Leave</button>
            </div>
            <div className=' w-full max-w-2xl p-4 py-2 flex flex-col items-start'>
                <h1 className='font-extrabold text-lg uppercase '>Selected Playset <span className=' font-extralight text-sm normal-case'>(by HOST)</span></h1>
                <PlaysetDisplay forceOpen selected playset={playset} />
            </div>
            <LobbyFooter />

        </div>

        :

        <div className='flex flex-col justify-start items-center w-full'>
            <button className='btn btn-ghost btn-wide loading noskew'></button>
            <a className='link font-bold clickable' href="/">Leave</a>

        </div>
    )
}


function HostLobby({ me, code }) {

    const { redirect, setMenu2, menu2, devMode, setPrompt, connectionErrorPrompt } = useContext(PageContext);


    const player_data = JSON.parse(localStorage.getItem("player-" + code));

    const [playersUpdated, setPlayersUpdated] = useState([]);
    const [startCondition, setStartCondition] = useState(false);

    const [playset, setPlayset] = useState(getPlaysetById("t0001"))
    const playsetRef = useRef(playset)

    const [playWithBury, setPlayWithBury] = useState(false);

    const [recommendBury, setRecommendBury] = useState(false);

    const [peer, setPeer] = useState(null);



    const [wrongPlayerNumber, setWrongPlayerNumber] = useState(true);


    const players = useRef([{ name: player_data.name, id: "HOST", host: true }]);

    const [playerState, setPlayerState] = useState(players.current);
    const [arePlayersOffline, setArePlayersOffline] = useState(false);


    useEffect(() => {
        if (localStorage.getItem(`game-${code}`) && JSON.parse(localStorage.getItem(`game-${code}`))?.game) return redirect(`/game/${code}`)
        startPeer();
    }, [])


    useEffect(() => {
        playsetRef.current = playset;
        updateAllClients();
    }, [playset])



    useEffect(() => {
        let ok = true;
        if (players.current.length < 3) ok = false;
        if (players.current.filter(p => p.ready).length < players.current.length - 1) ok = false; // checks if everyone is ready
        if (calculatePlaysetDisabled(playset, players.current.length)) ok = false;

        setStartCondition((devMode ? true : ok))
        


        setWrongPlayerNumber(calculatePlaysetDisabled(playset, players.current.length));

        setRecommendBury((playset?.cards?.length % 2) === (players.current.length % 2));
        setPlayWithBury((playset?.cards?.length % 2) === (players.current.length % 2));


        setPlayerState(players.current)

        var offlinePlayers = players?.current?.filter(p => !p?.conn && p?.id !== "HOST") || [];
        setArePlayersOffline((offlinePlayers?.length > 0));



    }, [playersUpdated, playset])



    function startPeer() {
        const peer = new Peer(constructPeerID(code, "host"));


        setPeer(peer);



        peer.on("connection", (conn) => {


            conn.on("open", () => {



                const playerID = { value: idGenAlphabet(3, [players.current.map(p => p.id)]) };


                conn.on("data", (data) => {
                    switch (data?.intent) {
                        case "join":

                            if (data?.payload?.id) playerID.value = data?.payload?.id

                            addPlayer(playerID.value, data?.payload?.name, conn)

                            conn.send({ intent: "joined_lobby", payload: { myId: playerID.value } })

                            updateAllClients();


                            break;

                        case "leave":
                            removePlayer(data?.payload?.id || playerID.value);

                            setPlayersUpdated([])

                            updateAllClients();
                            break;

                        case "ready":
                            readyPlayer(data?.payload?.id, true)
                            updateAllClients();
                            break;
                        case "unready":
                            readyPlayer(data?.payload?.id, false)
                            updateAllClients();
                            break;
                        case "connect":
                            conn.send({ intent: "redirect", payload: { to: "/lobby/" + code } });

                            break;
                        default:
                            return conn.close()
                    }




                });


                conn.on("close", () => {
                    players.current = players.current.map(p => (p?.id === playerID.value ? { ...p, conn: null } : p));

                    setPlayersUpdated([])

                    updateAllClients();

                })



            });


        });

        peer.on("error", (err) => {
            console.log(err)
        })

        peer.on("disconnected", (err) => {
            connectionErrorPrompt(true)
        })
    }


    function readyPlayer(id, ready = true) {
        const newPlayers = players.current.map(p => (p.id == id ? { ...p, ready } : p))


        players.current = newPlayers


        setPlayersUpdated([])

        return newPlayers
    }


    function addPlayer(id, name, conn) {

        if (players.current.filter(p => p?.id === id)[0]) {
            players.current = players.current.map(p => (p?.id === id ? { ...p, conn, name: (name ? name : p.name) } : p))
        } else players.current.push({ id, name, conn })




        setPlayersUpdated([])

        return players.current
    }

    function removePlayer(id) {
        const newPlayers = players.current.filter(p => p.id !== id);

        players.current = newPlayers

        setPlayersUpdated([])


    }


    function kickPlayer(id) {
        const player = players.current.filter(p => p.id == id)[0];
        player?.conn?.send({ intent: "redirect", payload: { to: "/" } })
        removePlayer(id);

    }





    function updateAllClients() {
        for (let element of players.current) {
            if (element.conn) {
                element.conn.send({ intent: "player_list", payload: { players: players.current.map(p => ({ ...p, conn: undefined })), playsetId: playsetRef.current?.id } })

            }
        }
    }

    function redirectAllClients(to) {
        for (let element of players.current) {
            if (element.conn) {
                element.conn.send({ intent: "redirect", payload: { to } })
            }
        }
    }





    function startGame() {

        if (arePlayersOffline) {
            setPrompt({
                title: "Some players are offline!",
                text: "They can reconnect by joining the room after you started.",
                onApprove: () => startIt()
            })
        } else startIt();




        function startIt() { 
            setPrompt(null);
            localStorage.setItem(`game-${code}`, JSON.stringify({ playsetId: playset.id, players: players.current.map(p => ({ ...p, conn: undefined, ready: undefined })), playWithBury: ((playWithBury || !playset.odd_card || playset?.force_bury) && !playset.no_bury), created_at: moment().format("x") }));

            redirectAllClients("/game/" + code)

            setTimeout(() => {
                if (peer) peer.destroy();
                setPrompt(null);

                redirect("/game/" + code, { replace: true })
            }, 200)
        }


    }


    function promptStartGame() {
        if (arePlayersOffline) return startGame();
        setPrompt({
            title: "Are you sure?",
            text: "DevMode: Check again if player count and playset match and if everyone is online",
            onApprove: () => startGame()
        })
    }


    function closeRoom() {
        redirectAllClients("/")

        redirect("/", { replace: true })
    }




    // Playsets
    function showAllPlaysets() {
        setMenu2(
            <ChoosePlaysetMenu onClick={(playset) => { setPlayset(playset); setMenu2(null) }} playerCount={players.current.length} currentPlayset={(playersUpdated ? playset : playset)} playersUpdated={playersUpdated} />
        )
    }


    return (
        <div className='flex flex-col justify-start items-center w-full pb-24'>
            <Lobby me={me} kickPlayer={kickPlayer} amHost players={playerState} arePlayersOffline={arePlayersOffline} />
            {devMode && <h1 className='bg-warning/50 w-full p-2 text-center text-warning-content text-title'>DEV MODE IS ENABLED</h1>}
            <div className='w-full max-w-2xl p-4 gap-2 flex flex-col justify-start items-center'>
                <button onClick={(devMode ? promptStartGame : startGame)} className={'w-full btn  text-title' + (startCondition ? " btn-primary  " : " btn-disabled ")} >Start game</button>
                <button className='link font-bold clickable' onClick={() => closeRoom()}>Close room</button>

            </div>
            <div className=' w-full max-w-2xl p-4 py-2 flex flex-col items-start'>
                <h1 className='font-extrabold text-lg uppercase flex items-center gap-2'>Selected Playset <Info tooltip="Playsets are predetermined decks of cards, that will be distributed among players. They often change the feel of the entire game, so choose wisely." /></h1>
                {wrongPlayerNumber && <WrongPlayerNumberPlayset />}
                <PlaysetDisplay forceOpen selected onClick={() => showAllPlaysets()} playset={playset} />
                <PlayWithBuryToggle recommendBury={recommendBury} bury={(playWithBury || !playset?.odd_card || playset?.force_bury) && !playset?.no_bury} onChange={bury => setPlayWithBury(bury)} disabled={!playset?.odd_card || playset?.no_bury || playset?.force_bury} />
            </div>

            <LobbyFooter />
        </div>
    )
}


function Lobby({ me, players = [], amHost, kickPlayer, arePlayersOffline }) { // playersUpdated is a work around to update players which are really a state


    return (
        <div className='w-full flex flex-col justify-start items-center'>
            <div className='bg-neutral flex items-center justify-center w-full'>
                <div className='w-full max-w-2xl p-4 gap-4 flex flex-col justify-start items-center'>
                    {players.map((player, i) => <PlayerRow showOnline={me?.id === "HOST"} showId={me?.id === "HOST" || player?.id === "HOST"} me={me} {...player} key={i} amHost={amHost} element={me?.id === "HOST" && !player.host &&
                        <div className='grow flex justify-end items-center'><button className='clickable btn-ghost p-3 -mr-1 rounded-md skew ' onClick={() => kickPlayer(player?.id)}><IoPersonRemoveSharp /></button></div>
                    } />)}
                    {players.length < 6 && [...Array(6 - players.length)].map((e, i) => <EmptyPlayerRow key={i} />)}
                </div>


            </div>
            {players?.length && <div className={'w-full bg-neutral text-center font-extrabold text-title pb-4 flex items-center justify-center gap-2 ' + (arePlayersOffline ? " text-accent " : " text-neutral-content ")}>{players?.length} <HiUsers size={22} /></div>}
        </div>
    )
}



function EmptyPlayerRow({ }) { // amHost is when the person looking at the screen is the host. host = is when the player who is rendered is a host
    return (
        <div className='bg-accent rounded-md h-12 skew p-2 pl-6 text-title font-extrabold text-sm w-full flex justify-between items-center'>

        </div>
    )
}






function LobbyFooter() {
    return (
        <>
            <div className='w-full max-w-2xl p-4 pb-32'>
                <h1 className='text-lg font-extrabold'>
                    SIGNALING LEADERSHIP:
                </h1>
                <div className='bg-base-200 text-info-content p-3 rounded-lg bold-child-error'>
                    You might have noticed: <br /><b>Leader cards are missing!</b><br />Any appointed leader should now <b>carry an object</b> of your choice (like a hat or cooking spoon) <b>to signal their leadership.</b><br />Any instructions the leader cards usually display, will be shown on your screen.
                </div>
            </div>
        </>
    )
}

export default LobbyView;