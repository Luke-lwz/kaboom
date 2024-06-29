import 'animate.css';
import '../game.css';
import { useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { redirect, useParams } from "react-router-dom";

// components
import Countdown from "../components/Countdown";
import { PageContext } from "../components/PageContextProvider";

// dependencies
import { Peer } from "peerjs";
import moment from 'moment';


// icons

import { RxAvatar, RxCardStack } from "react-icons/rx"
import { IoCloudOfflineOutline, IoColorPaletteSharp } from "react-icons/io5"
import { FiSend } from "react-icons/fi"



import { TbCards, TbPlayCard } from "react-icons/tb"



// helpers 
import { generateGame } from "../helpers/game";
import { getCardColorFromColorName, getCardFromId, getCardsForPlayset } from "../helpers/cards";
import Card, { CardFront } from "../components/Card";
import { constructPeerID, getPeerConfig } from "../helpers/peerid";
import { idGenAlphabet, rng } from "../helpers/idgen";
import SendCardMenu from '../components/menus/SendCardMenu';
import { getPlaysetById, maximizePlayset } from '../helpers/playsets';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import GameInfoMenu from '../components/menus/GameInfoMenu';


// Avatar shape="circle" 
import Avatar, { genConfig } from 'react-nice-avatar-vite-prod-fork'
import { SwapPropmt } from '../components/swapcards/SwapCards';
import { CardsRow } from '../components/playsets/PlaysetDisplay';
import CardInfoMenu from '../components/menus/CardInfoMenu';
import PlayerSelectMenu from '../components/menus/PlayerSelectMenu';
import toast from 'react-hot-toast';
import useWindowDimensions from '../hooks/useWindowDimensions';
import { interpolateColor } from '../helpers/color';
import { FaFlagCheckered } from 'react-icons/fa';
import { PiPersonSimpleRunBold } from 'react-icons/pi';
import { BsFillDoorOpenFill } from 'react-icons/bs';
import RoundInfoMenu from '../components/menus/RoundsInfoMenu';
import { Helmet } from 'react-helmet';



const ROUND_NAMES = ["NOT YET A", "FIRST", "SECOND", "THIRD", "FOURTH", "FITH"]


function GameView(props) {

    const { code } = useParams();

    const { setPrompt, redirect } = useContext(PageContext)

    const [loading, setLoading] = useState(true)
    const [host, setHost] = useState(false);
    const [me, setMe] = useState(null);




    const [screen, setScreen] = useState(null); // takes element as argument that is screened to all players



    useEffect(() => {

        setPrompt(null);
        if (!code) return
        if (localStorage.getItem(`game-${code}`)) setHost(true);
        const me = JSON.parse(localStorage.getItem(`player-${code}`));
        if (!me) {
            setTimeout(() => redirect("/?c=" + code), 100); // redirects to join home
            return
        }
        setMe(me);
        setLoading(false);

    }, [code])

    return (
        <>
            {screen && <div className="animate__animated animate__fadeIn absolute inset-0 z-[90] flex flex-col items-center justify-center screen-bg overflow-hidden">
                {screen}
            </div>
            }
            <div className={'flex flex-col justify-start items-start w-full h-full'}>
                <div className='overflow-visible w-full scrollbar-hide flex flex-col items-center' >
                    {loading ? <div className='loading' /> : host ? <HostGame me={me} code={code} setScreen={setScreen} setMe={setMe} /> : <ClientGame me={me} code={code} setScreen={setScreen} setMe={setMe} />}
                </div>
            </div>
        </>
    );
}



function ClientGame({ me, setMe, code, setScreen }) {


    const { connectionErrorPrompt, redirect, setMenu2 } = useContext(PageContext);


    const [playerList, setPlayerList] = useState([]);
    const [game, setGame] = useState(null);

    const [countdown, setCountdown] = useState(300)

    const [conn, setConn] = useState(null);

    const [hostTimeDifference, setHostTimeDifference] = useState(0);



    const avaConfig = useMemo(() => {
        return genConfig(me?.name || me?.id || "a");
    }, [me])




    useEffect(() => {
        if (countdown <= 0 && !conn) connectionErrorPrompt();
    }, [countdown])



    useEffect(() => {
        startPeer();

    }, [])


    useEffect(() => {
        if (!playerList) return;
        let newMe = playerList.filter(p => p.id == me.id)[0] || null;
        if (!newMe) return;
        localStorage.setItem(`player-${code}`, JSON.stringify(newMe))
        setMe(newMe);
    }, [playerList])



    async function startPeer() {
        const peer = new Peer(constructPeerID(code, me?.id), await getPeerConfig());

        peer.on("open", () => {
            var conn = peer.connect(constructPeerID(code, "host"));

            conn.on("open", () => {
                conn.send({ intent: "connect", payload: { id: me?.id } })
                setConn(conn);
            })


            conn.on("data", data => {
                switch (data?.intent) {
                    case "player_list":
                        setPlayerList(data?.payload?.players || []);
                        break;
                    case "connected": // game data will be sent with this
                        setGame(data?.payload?.game);
                        setPlayerList(data?.payload?.players)
                        setConn(conn)
                        var hostRN = data?.payload?.hostTimeUnixRN;
                        if (hostRN) {
                            var clientRN = moment().format("X");
                            setHostTimeDifference(clientRN - hostRN);

                        }
                        break;
                    case "game_data": // update game data
                        setGame(data?.payload?.game);
                        var hostRN = data?.payload?.hostTimeUnixRN;
                        if (hostRN) {
                            var clientRN = moment().format("X");
                            setHostTimeDifference(clientRN - hostRN);
                        }
                        break;
                    case "remove_screen":
                        setScreen(null);
                        break;
                    case "redirect":
                        if (data?.payload?.to) {
                            if (data?.payload?.delay) {
                                setTimeout(() => {
                                    conn.close();
                                    redirect(data?.payload?.to)
                                    peer.destroy()
                                }, data?.payload?.delay || 1000)
                            } else {
                                conn.close();
                                redirect(data?.payload?.to)
                                peer.destroy()
                            }

                        }
                        break;
                    case "remote-color-reveal":
                        var { color_name, player, from_player } = data?.payload || {}
                        var color = getCardColorFromColorName(color_name);
                        if (!color || !player || !from_player) return;
                        toast(<ColorRevealToast color={color} player={from_player} />, { id: "color:" + from_player?.id, duration: 5000, position: "top-left", style: { backgroundColor: "transparent", padding: "0px", boxShadow: "none" }, className: "p-0 -mx-3 bg-red-500 w-full max-w-md shadow-none drop-shadow-none" })
                        break;
                    case "remote-card-reveal":
                        var { card, player, from_player } = data?.payload || {}
                        var color = getCardColorFromColorName(card?.color_name);
                        if (!color || !player || !card || !from_player) return;
                        toast(<CardRevealToast card={{ ...card, color }} player={from_player} />, { id: "card:" + from_player?.id, duration: 5000, position: "top-left", style: { backgroundColor: "transparent", padding: "0px", boxShadow: "none" }, className: "p-0 -mx-3 bg-red-500 w-full max-w-md shadow-none drop-shadow-none" })
                        break;
                }
            })


            conn.on("error", () => { testConnection(); peer.destroy() })

            conn.on("close", () => { testConnection(); peer.destroy() })
        })



        peer.on("error", (err) => {
            if (!game) return connectionErrorPrompt();
            setConn(null);
        })





    }

    async function testConnection() {
        const peer = new Peer(await getPeerConfig());

        console.log("🌐")
        setConn(undefined); // undefined means loading
        setTimeout(() => {

            var conn = peer.connect(constructPeerID(code, "host"));
            if (!conn) {
                setConn(null);
                connectionErrorPrompt();
                return
            }

            const connection = { isOnline: null }

            conn.on("open", () => {
                peer.destroy();
                if (connection.isOnline === null) {
                    connection.isOnline = true;
                    startPeer();
                }
            })

            setTimeout(() => {
                if (connection.isOnline === null) {
                    connection.isOnline = false;
                    setConn(null);
                    peer.destroy();
                    setTimeout(() => testConnection(peer), 10 * 1000)
                }
            }, 2000)


        }, 2000)

    }









    // menu
    const handleCountdownClick = useCallback(() => {
        console.log("lol")
        setMenu2(
            <RoundInfoMenu game={game} />
        );
    }, [game])


    function showInfoMenu() {
        setMenu2(
            <GameInfoMenu me={me} code={code} game={game} players={playerList} />
        )
    }


    function execute(action, args = []) {
        if (!conn) return connectionErrorPrompt();
        conn.send({ intent: "player-fn", payload: { action, args } });
    }





    return (game ?
        <div className='flex flex-col justify-start items-center w-full h-full scrollbar-hide '>
            <div className="flex flex-row justify-center items-center p-3 w-full relative h-[5.2rem]">
                {!conn ? <div onClick={() => window.location.href = window.location.href} className="drop-shadow-sm clickable w-10 h-full absolute top-0 bottom-0 left-5 z-20 btn-base-100 flex items-center justify-center text-error text-3xl rounded-full  unskew font-bold">
                    {conn === null ? <IoCloudOfflineOutline /> : <span className='loading loading-spinner' />}
                </div>
                    :
                    <div className='absolute top-0 bottom-0 z-[100] h-full left-5 w-10 flex items-center justify-center drop-shadow-sm dropdown '>
                        <div className='dropdown'>
                            <label tabIndex={0}>
                                <Avatar className=' rounded-full' style={{ height: "2.2rem", width: "2.2rem" }} {...avaConfig} />
                            </label>
                            <ul tabIndex={0} className="dropdown-content pt-2 absolute z-20">
                                <AvatarMenu me={me} />
                            </ul>
                        </div>
                    </div>

                }
                <div className='flex flex-col justify-center items-center absolute top-2 right-0 left-0 z-20'>
                    <Countdown s={countdown} paused={game.paused} onClick={handleCountdownClick} />
                </div>
                <div onClick={() => showInfoMenu()} className="drop-shadow-sm clickable w-10 absolute top-0 bottom-0 h-full right-5 z-[100] btn-base-100 flex items-center justify-center text-neutral text-3xl rounded-full  unskew font-bold">
                    <TbCards />
                </div>


                <div onClick={handleCountdownClick} className='absolute -bottom-4 left-2 right-0 text-title text-secondary/70 text-center text-lg font-extrabold flex items-center justify-center'>
                    <MiniRoundDisplay game={game} />

                </div>
                {/* <button className="clickable w-10 h-10 absolute top-3 right-3 btn-accent rounded-full text-base-100 unskew font-bold text-xl">?</button> */}
            </div>

            <Game setCountdown={setCountdown} setScreen={setScreen} execute={execute} me={me} getPlayers={() => playerList} game={game} hostTimeDifference={hostTimeDifference} code={code} />

        </div>

        :

        <div className='flex flex-col justify-start items-center w-full mt-64'>
            <span className='loading loading-spinner'></span>
            {/* <button className='btn mt-6' onClick={() => window.location.href = window.location.href}>Reload</button> */}
            <a className='btn btn-ghost link font-bold clickable' href="/">Leave</a>

        </div>
    )
}


function HostGame({ me, setMe, code, setScreen }) {

    const { connectionErrorPrompt, setMenu2, setPrompt, setMenu } = useContext(PageContext);

    const [updatedRef, setUpdatedRef] = useState([]); // update like this manuallyUpdateRef(); every time ref is updated
    const [startCondition, setStartCondition] = useState(false);


    const [countdown, setCountdown] = useState(300)





    const [peer, setPeer] = useState(null)


    const game_data = JSON.parse(localStorage.getItem(`game-${code}`));




    const players = useRef(game_data?.players || []);
    const game = useRef(game_data?.game || null);


    const [playerState, setPlayerState] = useState([...players.current]);
    const [gameState, setGameState] = useState({ ...game.current });

    const avaConfig = useMemo(() => {
        return genConfig(me?.name || me?.id || "a");
    }, [me])

    useEffect(() => {
        startPeer()
        setupGame();
        updateMe();




    }, [code])


    useEffect(() => {
        setPlayerState([...players.current.map(p => (p?.conn ? { ...p, conn: true } : { ...p, conn: false }))])
        setGameState({ ...game.current })
        storeGame();
        sendToAll({ intent: "game_data", payload: { game: game.current, hostTimeUnixRN: moment().format("X") } })
        sendToAll({ intent: "player_list", payload: { players: players.current.map(p => ({ ...p, conn: undefined })) } })
        updateMe();
    }, [updatedRef])



    useEffect(() => {
        if (countdown <= 0) {
            setTimeout(() => {
                endRound();
                manuallyUpdateRef()
            }, 1200)

        }
    }, [countdown])





    function updateGameFor(playerIds = []) { // saves game n stuff but only sends updates to specific ids
        setPlayerState([...players.current.map(p => (p?.conn ? { ...p, conn: true } : { ...p, conn: false }))])

        setGameState({ ...game.current })
        storeGame();
        updateMe();
        for (let id of playerIds) {
            if (id.toUpperCase() !== "HOST") {
                sendTo(id, { intent: "game_data", payload: { game: game.current, hostTimeUnixRN: moment().format("X") } })
                sendTo(id, { intent: "player_list", payload: { players: players.current.map(p => ({ ...p, conn: undefined })) } })
            }
        }
    }

    function manuallyUpdateRef() {
        setUpdatedRef([]);
    }

    function updateMe() {
        let newMe = players.current.filter(p => p.id == me.id)[0] || null;
        if (!newMe) return;
        setMe(newMe);
    }

    async function startPeer() {
        const peer = new Peer(constructPeerID(code, "host"), await getPeerConfig());

        setPeer(peer);



        peer.on("connection", (conn) => {


            conn.on("open", () => {



                conn.on("data", (data) => {
                    console.log(data?.intent)
                    switch (data?.intent) {
                        case "join":
                            conn.send({ intent: "redirect", payload: { to: "/rejoin/" + code } });
                            break;
                        case "connect":
                            const playerData = getPlayerFromId(data?.payload?.id);
                            if (!playerData) conn.send({ intent: "redirect", payload: { to: "/rejoin/" + code + "/?m=1" } });
                            if (playerData?.conn) playerData.conn.close();
                            let newPlayers = players.current.map(p => (p.id === data?.payload?.id ? { ...p, conn } : p))
                            players.current = newPlayers;
                            updateGameFor([])
                            if (game) conn.send({ intent: "connected", payload: { game: game.current, players: players.current.map(p => ({ ...p, conn: undefined })), hostTimeUnixRN: moment().format("X") } })
                            break;
                        case "player-fn":
                            if (data?.payload) {
                                const { action, args } = data.payload;
                                if (action && args) {
                                    execute(action, args);
                                }
                            }
                            break;
                        default:
                            return conn.close()
                    }




                });


                conn.on("close", () => {
                    const newPlayers = players.current.map(p => (p?.conn?.connectionId === conn?.connectionId ? { ...p, conn: undefined } : p))
                    players.current = newPlayers;
                    updateGameFor([])

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


    function getPlayerFromId(id) {
        return players?.current?.filter(p => p.id == id)?.[0] || undefined;
    }



    function sendToAll(msg) {
        for (let element of players.current) {
            if (element?.conn) {
                element.conn.send(msg)
            }
        }
    }


    function sendTo(id, msg) {
        if (!id) return;
        const player = getPlayerFromId(id);
        if (!player?.conn) return
        player.conn.send(msg)
    }




    // setup game

    async function setupGame() {
        if (game?.current || !players?.current) return; // in case of reload

        var gameData = generateGame(players.current.length);

        console.log("ööö temp", game_data)


        const playset = await getPlaysetById(game_data?.playsetId)

        if (!playset) {
            toast.error("Playset not found.")
            return closeRoom(true);
        }

        const playWithBury = game_data?.playWithBury || false;


        var { cards, soberCard } = getCardsForPlayset({ playerCount: players?.current?.length, maximizedPlayset: maximizePlayset(playset), playWithBury });

        console.log(cards)





        var cardsInGameInitial = [...cards];


        var buriedCard = null;


        var cardsInGame = [];


        // distribute cards
        appendCard(cards);



        // appendStartingRoom
        var roomsLeft = Array.from({ length: players?.current?.length }, (_, i) => (i % 2) + 1)
        players.current = players.current.map(p => {
            const randomIndex = rng(0, roomsLeft.length - 1);
            const startingRoom = roomsLeft[randomIndex];
            roomsLeft.splice(randomIndex, 1);
            return ({ ...p, startingRoom })
        })




        // first leader
        const playersInRoom1 = players?.current?.filter(p => p?.startingRoom === 1);
        const playersInRoom2 = players?.current?.filter(p => p?.startingRoom === 2);

        const firstLeader1 = playersInRoom1?.[rng(0, playersInRoom1.length - 1)];
        const firstLeader2 = playersInRoom2?.[rng(0, playersInRoom2.length - 1)];


        players.current = players.current.map((p) => {
            let firstLeader = (p?.id === firstLeader1?.id || p?.id === firstLeader2?.id ? true : false);
            p.firstLeader = firstLeader
            return p;
        })


        function appendCard(cards) {
            var unappendedPlayers = players?.current?.filter(p => !p.card)
            if (!cards[0]) return; // if no cards are left


            if (!unappendedPlayers[0]) return buriedCard = cards[0];



            // var startingRoom = ((unappendedPlayers.length % 2) + 1);

            var index = rng(0, unappendedPlayers.length - 1);

            var playerId = unappendedPlayers.filter((p, i) => i == index)?.[0]?.id;

            if (!playerId) return connectionErrorPrompt();

            players.current = players.current.map(p => (p.id === playerId ? { ...p, card: cards[0] } : p))

            cardsInGame.push(cards.shift());
            return appendCard(cards);

        }

        cardsInGame = [...new Set(cardsInGame)];
        cardsInGame = cardsInGame.sort((a, b) => parseInt(a.slice(-3)) - parseInt(b.slice(-3)))

        game.current = { ...gameData, ...game_data, buriedCard, cardsInGame: cardsInGameInitial, soberCard, swapRequests: [], readyForRound: 1, paused: false, timeToReveal: false, pauseGameIndex: 0 };

        manuallyUpdateRef();
    }



    // Phase functions 

    function nextRound() {
        if (game.current.rounds.length === game.current.rounds.filter(r => r.ended).length) {
            game.current.phase = "boom";

            let pauseGameCards = game.current.cardsInGame.map(c => getCardFromId(c)).filter(card => {
                if (card.id === game.current.buriedCard) return false;
                if (!card.pausegamenr) return false;
                return true;
            });

            if (pauseGameCards.length <= 0) game.current.timeToReveal = true; // if no card with a pauseGameNr is available
            manuallyUpdateRef();
            return;
        }


        game.current.rounds = game.current.rounds.map((round, i) => {
            var roundBefore = game.current.rounds[i - 1];
            if (!roundBefore || (roundBefore?.ended && !round?.started_at)) {
                round.started_at = moment().format("X");
                game.current.round = i + 1;
            }

            return round;
        });
        manuallyUpdateRef();

    }

    function endRound() {
        game.current.rounds = game.current.rounds.map(round => (round?.started_at ? { ...round, ended: true } : round));
        game.current.paused = false;
    }



    // round functions 






    function storeGame() {
        localStorage.setItem(`game-${code}`, JSON.stringify({ game: game?.current, players: players?.current.map(p => ({ ...p, conn: undefined })) }))
    }






    // peer functions

    function isInRoom(id) {
        let newPlayerss = players.current.map(p => (p.id === id ? { ...p, isInRoom: true } : p))
        players.current = newPlayerss;

        if (players.current.length === players.current.filter(p => p.isInRoom).length) { // if all players are ready
            game.current.phase = "rounds";
            nextRound();
            manuallyUpdateRef();
        }
    }


    function readyForNextRound(id) {
        let newPlayerss = players.current.map(p => (p.id === id ? { ...p, readyForRound: (game?.current?.round || p.readyForRound) + 1 } : p))
        players.current = newPlayerss;

        if (players.current.length === players.current.filter(p => p.readyForRound === (game?.current?.round + 1)).length) { // if all players are ready
            game.current.phase = "rounds";
            nextRound();
            manuallyUpdateRef();
        }
    }



    const PlayerFn = { // functions can be called by peer and by host {intent: "player-fn", payload: {action: "", args. []}}
        "request-swap-card": (initId, withId) => {
            if (!initId || !withId) return
            const requests = game.current?.swapRequests?.filter(r => r.initId !== initId && r.withId !== initId) || [];
            game.current.swapRequests = [...requests, { initId, withId }];
            updateGameFor([initId, withId]);
        },
        "accept-swap-card-request": (initId, withId) => {
            const [initCard, withCard] = [getPlayerFromId(initId)?.card, getPlayerFromId(withId)?.card];
            players.current = players.current.map(player => {

                if (player?.id === initId) player.card = withCard;
                if (player?.id === withId) player.card = initCard;


                return player;
            })
            PlayerFn["remove-swap-card-request"](initId, withId);
        },
        "remove-swap-card-request": (initId, withId) => {
            if (!initId) return
            game.current.swapRequests = game?.current?.swapRequests?.filter(r => r.initId !== initId);
            updateGameFor([initId, withId]);
        },
        "get-sober-card": () => {
            if (!game?.current?.soberCard) return;
            players.current = players.current.map(p => (p?.card === "drunk" ? { ...p, card: game?.current?.soberCard } : p))
            manuallyUpdateRef();
        },
        "am-in-room": (id) => {
            isInRoom(id);
        },
        "ready-for-next-round": (id) => {
            readyForNextRound(id);
        },
        "redirect-to-lobby": () => {
            var to = `/lobby/${code}`;
            localStorage.setItem(`game-${code}`, "{}");
            sendToAll({ intent: "redirect", payload: { to, delay: 1500 } })
            window.location.href = to;
        },
        "close-room": () => {
            closeRoom();
        },
        "next-pause-game-number": (id) => {
            if (!id) return


            let pauseGameCards = game.current.cardsInGame
                .map(c => getCardFromId(c))
                .filter(card => {
                    if (card.id === game.current.buriedCard) return false;
                    if (!card.pausegamenr) return false;
                    return true;
                })
                .sort((a, b) => a.name - b.name) // just to be sure
                .sort((a, b) => a.pausegamenr - b.pausegamenr);

            if (pauseGameCards.length - 1 <= game.current.pauseGameIndex) {
                game.current.timeToReveal = true;
                manuallyUpdateRef();
                return
            }

            let pauseGameCard = pauseGameCards[game.current.pauseGameIndex];



            var player = players.current.filter(p => p.card == pauseGameCard?.id)[0];
            if (!player) return

            if (id === player?.id || id.toUpperCase() === "HOST") return doIt();


            function doIt() {
                game.current.pauseGameIndex++;
                manuallyUpdateRef();
            }

        },
        "force-start-game": () => {
            game.current.phase = "rounds";
            nextRound();
        },
        "change-color-reveal": () => {
            game.current.color_reveal = !game.current.color_reveal;
            manuallyUpdateRef();

        },
        "change-remote-mode": (bool) => {
            game.current.remote_mode = bool;
            manuallyUpdateRef();
        },
        "do-remote-color-reveal": (playerIdArray, color_name, from_player) => {
            for (let i = 0; i < playerIdArray.length; i++) {
                const playerId = playerIdArray[i];
                const player = getPlayerFromId(playerId)
                const color = getCardColorFromColorName(color_name);
                if (!player || !color || !from_player) return
                if (playerId?.toUpperCase() === "HOST") toast(<ColorRevealToast color={color} player={from_player} />, { id: "color:" + playerId, duration: 5000, position: "top-left", style: { backgroundColor: "transparent", padding: "0px", boxShadow: "none" }, className: "p-0 -mx-3 bg-red-500 w-full max-w-md shadow-none drop-shadow-none" })
                else sendTo(playerId, { intent: "remote-color-reveal", payload: { color_name, player: { ...player, conn: undefined }, from_player } })
            }
        },
        "do-remote-card-reveal": (playerIdArray, card, from_player) => {
            for (let i = 0; i < playerIdArray.length; i++) {
                const playerId = playerIdArray[i];
                const player = getPlayerFromId(playerId)
                const color = getCardColorFromColorName(card?.color_name);
                if (!player || !card || !color || !from_player) return

                if (playerId?.toUpperCase() === "HOST") toast(<CardRevealToast card={{ ...card, color }} player={from_player} />, { id: "card:" + from_player?.id, duration: 5000, position: "top-left", style: { backgroundColor: "transparent", padding: "0px", boxShadow: "none" }, className: "p-0 -mx-3 bg-red-500 w-full max-w-md shadow-none drop-shadow-none" })
                else sendTo(playerId, { intent: "remote-card-reveal", payload: { card, player: { ...player, conn: undefined }, from_player } })
            }
        }
    }


    function closeRoom(force = false) {

        if (force) close()
        else setPrompt({ title: "Are you sure?", text: "This will delete all progress and player connections.", onApprove: close })


        function close() {
            localStorage.removeItem(`game-${code}`);
            sendToAll({ intent: "redirect", payload: { to: "/", delay: 1000 } })
            window.location.href = "/";
        }
    }





    // Menu 

    function showInfoMenu() {
        setMenu2(
            <GameInfoMenu execute={execute} nextRound={nextRound} endRound={endRound} me={me} code={code} game={gameState} players={playerState} isHost />
        )
    }


    function handleTimerPause() {
        game.current.paused = true;
        setMenu2(null);
        manuallyUpdateRef();
    }

    function handleTimerResume() {

        var ts = moment().format("X");

        var round = game.current.rounds[game.current.round - 1]

        game.current.rounds[game.current.round - 1].started_at = JSON.stringify(parseInt(ts) - ((round.time * 60) - countdown + 3));
        game.current.paused = false;

        setMenu2(null);

        manuallyUpdateRef();
    }


    const handleCountdownClick = useCallback(() => {
        setMenu2(
            <RoundInfoMenu game={gameState} paused={gameState.paused} onPause={gameState.paused ? handleTimerResume : handleTimerPause} onEndRound={() => {
                setPrompt({ title: "End round?", text: "This action is irreversible.", onApprove: () => { endRound(); manuallyUpdateRef() } })
            }} onEndGame={endGame} />
        );
    }, [gameState])



    function execute(action, args = []) {
        if (PlayerFn[action]) PlayerFn[action](...args);
    }


    function endGame() {
        setMenu2(null)
        setPrompt({ title: "End game?", text: "This will reveal everyone's card.", onApprove: () => endIt() });


        function endIt() {
            var ts = moment().format("X")
            game.current.rounds = game.current.rounds.map(r => ({ started_at: ts, ...r, ended: true, }));
            game.current.phase = "boom";
            nextRound();
        }
    }

    return (
        <div className='flex flex-col justify-start items-center w-full h-full scrollbar-hide'>
            <div className="flex flex-row justify-center items-center p-3 w-full relative overflow-visible h-[5.2rem]">

                <div className='absolute top-0 bottom-0 h-full left-5 w-10 flex items-center justify-center drop-shadow-sm z-[100] overflow-visible'>
                    <div className='dropdown'>
                        <label tabIndex={0}>
                            <Avatar className=' rounded-full' style={{ height: "2.2rem", width: "2.2rem" }} {...avaConfig} />
                        </label>
                        <ul tabIndex={0} className="dropdown-content pt-2 absolute">
                            <AvatarMenu me={me} isHost execute={execute} />
                        </ul>
                    </div>
                </div>


                <div onClick={() => showInfoMenu()} className="drop-shadow-sm clickable w-10 absolute top-0 bottom-0 h-full right-5 z-[100] btn-base-100 flex items-center justify-center text-neutral text-3xl rounded-full  unskew font-bold">
                    <TbCards />
                </div>

                <div className='flex flex-col justify-center items-center absolute top-2 right-0 left-0 z-20'>
                    <Countdown s={countdown} paused={gameState.paused} onClick={handleCountdownClick} />
                </div>

                <div style={{ zIndex: 11 }} onClick={handleCountdownClick} className='absolute -bottom-4 left-2 right-0 text-title text-secondary/70 text-center text-lg font-extrabold flex items-center justify-center'>
                    <MiniRoundDisplay game={gameState} />
                </div>
                {/* <button className="clickable w-10 h-10 absolute top-3 right-3 btn-accent rounded-full text-base-100 unskew font-bold text-xl">?</button> */}
            </div>


            <Game setCountdown={setCountdown} setScreen={setScreen} execute={execute} me={me} getPlayers={() => players.current} game={gameState} endRound={endRound} nextRound={nextRound} code={code} />


        </div>
    )
}



function Game({ me, getPlayers = () => null, game, execute = () => { }, setScreen, setCountdown, hostTimeDifference = 0, endRound = () => { }, nextRound = () => { }, code }) { // execute == function that executes PlayerFunctions from peer at host or by host at host

    const [card, setCard] = useState(null);


    const [hideCard, setHideCard] = useState(true);


    const { setMenu, setMenu2, setPrompt } = useContext(PageContext);


    const round = useRef(game?.rounds?.[game?.round - 1 || 0]);


    const getHostTs = useCallback(() => {
        return JSON.stringify(moment().format("X") - hostTimeDifference);
    }, [hostTimeDifference]);



    useEffect(() => {
        const interval = setInterval(() => {

            if (!round?.current?.started_at || round?.current?.paused) return
            var ts = getHostTs();
            var tsInt = parseInt(ts);

            var startedAtInt = parseInt(round?.current?.started_at);

            var roundTime = round?.current?.time * 60; // formats to milliseconds

            var extra3secs = 3;
            var ends_at = (startedAtInt) + roundTime + extra3secs;




            let lastTime = startedAtInt + (tsInt - startedAtInt);

            if (tsInt >= lastTime) { // newSecond
                var secondsLeft = ends_at - lastTime;


                if (secondsLeft <= 0) setCountdown(0)
                else if (secondsLeft >= (roundTime)) setCountdown(roundTime);
                else setCountdown(secondsLeft);
            }

        }, 250)


        return () => clearInterval(interval);
    }, [])








    useEffect(() => {
        if (!me?.card) return
        var card = getCardFromId(me?.card);
        setCard(card);


        round.current = { ...(game?.rounds?.[game?.round - 1 || 0] || { time: 3, hostages: 2, started_at: "12" }), paused: game.paused };
        getSwapRequests();
        gameHasUpdated();
    }, [me, game])


    useEffect(() => {
        gameHasUpdated();
    }, [card])





    // stuff
    function gameHasUpdated() {
        if (!game?.phase || !me?.startingRoom) return

        setScreen(null)

        switch (game?.phase) {
            case "rooms":
                setScreen(<GoToRoomScreen roomNr={me?.startingRoom} onReady={() => execute("am-in-room", [me.id])} onForceReady={me?.id?.toUpperCase() === "HOST" ? () => execute("force-start-game") : undefined} />)
                break;
            case "rounds":
                if (game?.rounds?.filter(r => r.started_at)?.length === game?.rounds?.filter(r => r.ended)?.length) {
                    announceRoundEnd();
                }
                updateCountdown(game);
                break;
            case "boom":
                if (game?.timeToReveal) {
                    if (me?.id?.toUpperCase() === "HOST") {
                        setScreen(
                            <RevealAllScreen card={card} buriedCard={getCardFromId(game?.buriedCard)} onLobby={() => {
                                execute("redirect-to-lobby")
                            }} onClose={() => {
                                execute("close-room")
                            }} />
                        )
                    } else {
                        setScreen(
                            <RevealAllScreen card={card} buriedCard={getCardFromId(game?.buriedCard)} />
                        )
                    }

                } else {
                    let pauseGameCards = game.cardsInGame
                        .map(c => getCardFromId(c))
                        .filter(card => {
                            if (card.id === game.buriedCard) return false;
                            if (!card.pausegamenr) return false;
                            return true;
                        })
                        .sort((a, b) => a.name - b.name) // just to be sure
                        .sort((a, b) => a.pausegamenr - b.pausegamenr);

                    let pauseGameCard = pauseGameCards[game.pauseGameIndex]

                    const players = getPlayers();
                    var player = players.filter(p => p.card == pauseGameCard?.id)[0];
                    if (!player) return
                    player = { ...player, avaConfig: genConfig(player.name || player.id || "a") }




                    setPrompt(null);
                    setMenu(null);
                    setMenu2(null);

                    setScreen(
                        <PauseGameNumberScreen card={pauseGameCard} player={player} meId={me?.id} onClick={() => execute("next-pause-game-number", [me?.id])} />
                    )

                }
                break;
        }
    }


    function announceRoundStart(roundName, roundNumber, totalRounds = 3) {
        setMenu(null);
        setMenu2(null);
        setScreen(<RoundStartScreen roundName={roundName} roundNumber={roundNumber} totalRounds={totalRounds} />)
        setTimeout(() => {
            setScreen(null);
        }, 2.7 * 1000)
    }


    function announceRoundEnd(roundName) {
        setMenu(null);
        setMenu2(null);
        setHideCard(true)
        setScreen(<RoundEndScreen hostages={round.current?.hostages} onReady={() => execute("ready-for-next-round", [me?.id])} onForceReady={me?.id === "HOST" ? () => { endRound(); nextRound() } : undefined} />)
    }

    function getRoundName(game) {
        var l = game?.rounds?.length || 3;
        var r = game.round;

        if (r >= l) return "LAST";
        return ROUND_NAMES[r];
    }



    function updateCountdown(game) {
        if (!game || game?.paused) return;
        var ts = getHostTs();
        var tsInt = parseInt(ts);
        var round = game?.rounds?.[game?.round - 1 || 0] || { time: 3, hostages: 2, started_at: "12" }; // 💥 started_at: Seconds (not ms)
        if (round?.paused) return;
        var roundTime = round.time * 60; // formats to milliseconds
        var extra3secs = 3;

        var startedAtInt = parseInt(round.started_at);

        var ends_at = (startedAtInt) + roundTime + extra3secs;


        if (tsInt < (startedAtInt) + extra3secs) announceRoundStart(getRoundName(game), game?.round, game?.rounds?.length);
        else if (tsInt >= ends_at) return setCountdown(0);


    }



    function getPlayerFromId(id) {
        const players = getPlayers().map(p => ({ ...p, avaConfig: genConfig(p?.name || p?.id || "a") }));
        return players.filter(p => p.id == id)?.[0] || undefined;
    }


    const showSendCard = useCallback((card) => {
        const players = getPlayers();
        if (!players) return


        setMenu(
            <SendCardMenu onCancel={() => setMenu(null)} card={card} me={me} getSoberCard={() => { execute("get-sober-card", [me?.id]); setMenu(null); setMenu2(null) }} lastRound={game.rounds.length === game.round} players={players.filter(p => p.id !== me.id)} onClick={(id) => { execute("request-swap-card", [me?.id, id]); setMenu(null); setMenu2(null) }} />
        )

    }, [game, me]);

    function onRemoteCardReveal() {

        const players = getPlayers();
        if (!players) return
        setMenu(<PlayerSelectMenu
            color={card?.color?.primary || "#0019fd"}
            players={players.filter(p => p.id !== me.id)}
            onSelect={onSelect}
            buttonText={<>REVEAL <FiSend className=" -rotate-45 ml-2 noskew" /></>}
            titleElement={
                <div className='w-full flex items-center justify-start text-title text-base-content'>
                    <TbPlayCard size={28} className='mr-2' /> CARD REVEAL
                </div>
            }
        />)


        function onSelect(playerIdArray) {
            setMenu(null)
            if (playerIdArray.length > 0) {
                toast.success("Card revealed");
                execute("do-remote-card-reveal", [playerIdArray, { ...card, info: undefined, color: undefined }, me])
            }
        }
    }

    function onRemoteColorReveal() {
        const players = getPlayers();
        if (!players) return
        setMenu(<PlayerSelectMenu
            color={card?.color?.primary || "#0019fd"}
            players={players.filter(p => p.id !== me.id)}
            onSelect={onSelect}
            buttonText={<>REVEAL <FiSend className=" -rotate-45 ml-2 noskew" /></>}
            titleElement={
                <div className='w-full flex items-center justify-start text-title text-base-content'>
                    <IoColorPaletteSharp size={28} className='mr-2' /> COLOR REVEAL
                </div>
            }
        />)

        function onSelect(playerIdArray) {
            setMenu(null)
            if (playerIdArray.length > 0) {
                toast.success("Color revealed");
                execute("do-remote-color-reveal", [playerIdArray, card?.color_name, me])
            }
        }
    }


    function getSwapRequests() {
        const request = game?.swapRequests?.filter(r => r.initId === me?.id || r.withId === me?.id)[0];
        if (!request) return setPrompt(null)
        const { initId, withId } = request;
        const [initPlayer, withPlayer] = [getPlayerFromId(initId), getPlayerFromId(withId)];
        if (request.initId === me?.id) { // if requester
            setPrompt({ element: <SwapPropmt initPlayer={initPlayer} withPlayer={withPlayer} onCancel={() => execute("remove-swap-card-request", [initId, withId])} /> })
        } else { // if requestee
            setMenu(null);
            setMenu2(null);
            setPrompt({ element: <SwapPropmt initPlayer={initPlayer} withPlayer={withPlayer} onAccept={() => execute("accept-swap-card-request", [initId, withId])} onCancel={() => execute("remove-swap-card-request", [initId, withId])} /> })

        }
    }



    return (
        <>

            <Helmet>
                <title>Kaboom • Game • {code?.toUpperCase() || ""}</title>
                <meta name="title" content="Kaboom" />
                <meta name="description" content={`Kaboom: Join ${game?.players?.[0]?.name ? game.players[0].name + "'s " : ""} game (${code?.toUpperCase()}) for an explosive time with your friends`} />
            </Helmet>
            <div className="absolute inset-0 flex flex-col justify-center items-center z-10 scrollbar-hide top-8">
                {me?.firstLeader && game?.phase === "rounds" && game?.round === 1 && <div style={{ animationDelay: "1s" }} className='w-full h-0 relative text-center animate__animated animate__fadeIn'>
                    <h2 className='text-title title-shadow-secondary-xs font-extrabold text-neutral text-xl absolute left-0 right-0 bottom-4'>You're first leader</h2>
                </div>}
                {card && <Card nomotion={false} remoteMode={game?.remote_mode} onRemoteColorReveal={onRemoteColorReveal} onRemoteCardReveal={onRemoteCardReveal} allowColorReveal={game?.color_reveal} hide={hideCard} setHide={setHideCard} card={card} sendCard={showSendCard} />}
            </div>


            {/* <div className='absolute inset-2 z-20 top-auto clickable flex justify-center items-center text-title bg-neutral text-neutral-content rounded-lg p-2.5 gap-2'>
                <div className='-rotate-90 scale-110'>
                    <RxCardStack />
                </div>
                <h1 className='hi'>Deck</h1>
            </div> */}
        </>
    )
}




function AvatarMenu({ isHost, me, execute = () => { } }) {

    const { setPrompt } = useContext(PageContext);

    function closeRoom() {
        execute("close-room");
    }


    function toLobby() {
        setPrompt({
            title: "Are you sure?",
            text: "This will make everyone return to the lobby.",
            onApprove: () => execute("redirect-to-lobby")
        })
    }


    function leaveRoom() {
        window.location.href = "/";
    }

    return (
        <div className='bg-neutral rounded-lg p-4 text-neutral-content w-full flex flex-col justify-start items-start gap-2'>
            <h1 className='font-extrabold text text-title'>{me.name}</h1>
            <button onClick={isHost ? closeRoom : leaveRoom} className='btn btn-primary w-44'>{isHost ? "CLOSE GAME" : "LEAVE GAME"}</button>
            {isHost && <button className='btn btn-success w-44 text-success-content' onClick={() => toLobby()}>Back to lobby</button>}
        </div>
    )
}



function MiniRoundDisplay({ game }) {


    const { setMenu } = useContext(PageContext);

    const { roundNumber, totlaRounds, nextHostageNumber } = useMemo(() => {
        const roundNumber = game?.round;
        const totlaRounds = game?.rounds?.length;
        const nextHostageNumber = game?.rounds?.[roundNumber - 1]?.hostages;
        return { roundNumber, totlaRounds, nextHostageNumber }
    }, [game])

    return (
        <div className='w-fit px-2 py-1 bg-blue-800 text-white rounded flex items-center justify-center gap-2 text-base'>
            <FaFlagCheckered className='text-white/70' />
            <span>{roundNumber}/{totlaRounds}</span>
            <span className='text-white/50'>|</span>
            <div className='flex justify-start items-center'>
                <PiPersonSimpleRunBold className='text-sm text-white/70' />
                <BsFillDoorOpenFill style={{ transform: "scaleX(-1)" }} className="text-white/70" />
                <span className='ml-2'>{nextHostageNumber}</span>
            </div>

        </div>
    )

}







// SCREENS

function GoToRoomScreen({ roomNr = 1, onReady = () => { }, onForceReady }) {

    const [clicked, setClicked] = useState(false);

    function handleClick() {
        onReady();
        setClicked(true);
    }

    return (
        <>
            <div className='flex flex-col items-center justify-center w-full absolute inset-0 z-10'>
                <div className={"uppercase font-extrabold text-title text-3xl mb-4 animate__animated animate__bounceInLeft" + (roomNr == 1 ? " text-primary " : " text-secondary ")}>
                    GO TO
                </div>
                <div className={"uppercase font-extrabold text-title text-5xl mb-8 animate__animated animate__bounceInRight" + (roomNr == 1 ? " text-secondary " : " text-primary ")}>
                    ROOM {roomNr}
                </div>
                <button className={"btn btn-wide btn-neutral text-title " + (clicked ? " btn-disabled " : "  ")} onClick={handleClick}>{clicked ? " Waiting... " : " Ready? "}</button>
                {onForceReady && <button className='text-normal font-light text-sm underline mt-6 p-3 ' onClick={onForceReady}>Force next</button>}

            </div>

            <div className={" h-[100vh] w-[100vh] p-22 absolute rounded-full animate-left-to-right scale-[5] -top-[50vh] opacity-50 " + (roomNr == 1 ? " circular-gradient-secondary " : " circular-gradient-primary ")}></div>
            <div className={" h-[100vh] w-[100vh] p-22 absolute rounded-full animate-right-to-left scale-[5] -bottom-[50vh] opacity-50 " + (roomNr == 1 ? " circular-gradient-primary " : " circular-gradient-secondary ")}></div>

        </>
    )
}


function RoundStartScreen({ roundName, roundNumber = 1, totalRounds = 3 }) {


    const { text, color, shadowColor } = useMemo(() => {
        switch (roundName?.toUpperCase()) {
            case "FIRST":
                return { text: "FIRST ROUND", color: "#ffffff", shadowColor: "#00ff00" };
            case "LAST":
                return { text: "LAST ROUND", color: "#ffffff", shadowColor: "#ff0000" };
            default:
                return { text: "ROUND " + roundNumber, color: "#ffffff", shadowColor: interpolateColor("#00ff00", "#ff0000", ((roundNumber - 1) / (totalRounds - 1)) * 100) };
        }
    }, [roundName, roundNumber])

    return (
        <div id="round-start-screen-outer" className='absolute inset-0 flex flex-col items-center  justify-center anim-out-after-3'>
            {/* <div className={" h-[100vh] w-[100vh] p-22 absolute rounded-full animate-right-to-left scale-[5] -top-[50vh]  opacity-50 " + (roundName.toUpperCase() === "FIRST" ? " circular-gradient-success " : roundName.toUpperCase() === "LAST" ? " circular-gradient-primary " : " circular-gradient-sky ")}></div>
            <div className={" h-[100vh] w-[100vh] p-22 absolute rounded-full animate-left-to-right scale-[5] -bottom-[50vh] opacity-50 " + (roundName.toUpperCase() === "FIRST" ? " circular-gradient-green " : roundName.toUpperCase() === "LAST" ? " circular-gradient-wine " : " circular-gradient-secondary ")}></div> */}



            {/* <RunningTextAnimation text={text} color={color} shadowColor={shadowColor} />
             */}

            <TextBandsAnimation text={text} color={color} shadowColor={shadowColor} />
        </div>
    )
}


const DIMENSIONS_MULTIPLIER = 2;


function TextBandsAnimation({ text, color, shadowColor, animationType = "opposite-lines", rotation = -45 }) {

    const ANIMATION_TYPES = {
        ["opposite-lines"]: ["game-start-strip", "game-start-strip-inverted", 0, "game-start-strip-opacity-animate"],
        ["lines"]: ["game-start-strip", "game-start-strip", 2, "game-start-strip-opacity-animate"],
        ["lines-inverted"]: ["game-start-strip-inverted", "game-start-strip-inverted", 2, "game-start-strip-opacity-animate"],
    }

    const boxClasses = "text-title text-3xl font-extrabold flex items-center justify-start gap-4 p-2 py-0.5 w-fit";

    const textShadowOffset = 3;

    const { width, height } = useWindowDimensions();



    const [textDimensions, setTextDimensions] = useState({ textWidth: 0, textHeight: 0 });



    useEffect(() => {

        const el = document.createElement("div");
        el.style.position = "absolute";
        el.style.top = "-9999px";
        el.style.left = "-9999px";



        el.classList.add(...boxClasses.split(" "));


        // text
        const textSplit = text.split(" ");

        for (let i = 0; i < textSplit.length; i++) {
            const word = textSplit[i];
            const wordDiv = document.createElement("div");
            const textNode = document.createTextNode(word);
            wordDiv.style.textShadow = `${textShadowOffset}px ${textShadowOffset}px 0px #ff00ff`;
            // 🪠🪠🪠🪠🪠🪠🪠🪠

            wordDiv.appendChild(textNode);
            el.appendChild(wordDiv);
        }


        document.body.appendChild(el);



        setTimeout(() => {

            setTextDimensions({ textWidth: el.clientWidth, textHeight: el.clientHeight });
        })

    }, []);


    const { countForWidth, countForHeight } = useMemo(() => {
        if (textDimensions?.textWidth && textDimensions?.textWidth !== 0 && textDimensions?.textHeight && textDimensions?.textHeight !== 0) {
            return { countForWidth: Math.ceil(width / textDimensions?.textWidth * DIMENSIONS_MULTIPLIER), countForHeight: Math.ceil(height / textDimensions?.textHeight * DIMENSIONS_MULTIPLIER) }
        }
        return { countForWidth: 0, countForHeight: 0 }
    }, [width, height, textDimensions, textDimensions])




    const [animationClass, animationClassInverted, delayMultiplier = 2, containerAnimation = ""] = ANIMATION_TYPES[animationType || "opposite-lines"];



    return (
        <div style={{ transform: `rotate(${rotation}deg) scale(1.${Math.abs(rotation)})` }} className={'h-full flex flex-col items-center justify-center gap-2 ' + containerAnimation}>

            {Array.from(Array(countForHeight).keys()).map(ih => {




                const inverted = ih % 2 === 0;

                return (
                    <div style={{ animationDelay: `${200 + ((ih) * delayMultiplier)}ms` }} className={'w-full flex items-center justify-center ' + (inverted ? animationClass : animationClassInverted)}>
                        {Array.from(Array(countForWidth).keys()).map(iw => {

                            return (
                                <div className={boxClasses}>
                                    {text.split(" ").map((letter, i) => {

                                        const _color = i % 2 === 0 ? color : shadowColor;
                                        const _shadowColor = i % 2 === 0 ? shadowColor : color;

                                        return <div key={i} style={{ color: inverted ? _shadowColor : _color, textShadow: `3px 3px 0px ${inverted ? _color : _shadowColor}` }}>{letter}</div>
                                    })}
                                </div>
                            )
                        })}
                    </div>
                )
            })}


        </div>

    )

}


function RunningTextAnimation({ text, color, shadowColor }) {

    const [inverted, setInverted] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setInverted(inverted => !inverted);
        }, 180)

        return () => clearInterval(interval);
    }, [])

    return (
        <div className='text-title text-4xl font-extrabold'>
            {text.split("").map((letter, i) => {

                const _color = i % 2 === 0 ? color : shadowColor;
                const _shadowColor = i % 2 === 0 ? shadowColor : color;

                return <span key={i} style={{ color: inverted ? _shadowColor : _color, textShadow: `3px 3px 0px ${inverted ? _color : _shadowColor}` }}  >{letter}</span>
            })}
        </div>
    )
}


function RoundEndScreenTest({ hostages, onReady = () => { }, onForceReady }) {

    return (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-4'>
            <div className='bg-blue-800 -z-10 w-[54vw] aspect-square absolute -top-[35vw] -left-[20vw] rotate-[57deg] ' />
            <div className='bg-blue-800 -z-10 w-[120vw] aspect-[2/1] absolute -left  -rotate-[16deg] -right-[12vw] -bottom-[36vw]' />
            <div className='bg-base-100 -z-20 w-[120vw] h-[100vh] absolute -left  rotate-[29deg] -right-[4vw] -bottom-[36vw]' />
            <div className='bg-base-200 -z-30 w-[160vw] h-[100vh] absolute -left  -rotate-[20deg] -right-[34vw] -top-[4vw]' />


            <div className='flex flex-col items-center justify-center gap-4 -translate-y-4'>
                <h1 className='font-extrabold text-6xl text-blue-800 text-title'>{hostages}</h1>
                <h2 className='font-extrabold text-3xl text-blue-800 uppercase tracking-tighter'>Hostages</h2>

                <ReadyButton onReady={onReady} className='!bg-blue-800' />

                {onForceReady && <div onClick={onForceReady} className='text-normal underline text-sm text-blue-800 mt-2 cursor-pointer'>Force next round</div>}

            </div>
        </div>
    )
}

function RoundEndScreen({ hostages, onReady = () => { }, onForceReady }) {




    return (
        <div className='absolute inset-0 flex flex-col items-center justify-start pt-20 screen-bg-blue font-extrabold text-title text-white drop-shadow-md text-4xl gap-3 text-center overflow-y-scroll overflow-hidden scrollbar-hide'>

            <h2 style={{ animationDelay: "0ms" }} className='animate__animated animate__fadeInUp '>Round over!</h2>
            <h3 style={{ animationDelay: "600ms" }} className='animate__animated animate__fadeInUp text-2xl text-normal -mt-2 mb-1'>Leaders, select...</h3>

            <RadialNumberAnnouncement number={hostages} />

            <h3 style={{ animationDelay: "1000ms" }} className='animate__animated animate__fadeInUp text-2xl text-normal mt-1 mb-4 '>...hostage{hostages === 1 ? "" : "s"}.</h3>
            <ul style={{ animationDelay: "1600ms" }} className='animate__animated animate__fadeInUp w-full text-normal text-xl font-medium text-left px-4 flex flex-col items-center gap-1.5'>
                <Li title="2. Parlay" delay={1800}>
                    Leaders meet between rooms without hostages.
                </Li>
                <Li title="3. Exchange hostages" delay={2000}>
                    Equal number of hostages are exchanged.
                </Li>
                <Li title="4. Ready up!" delay={2200}>
                    Hit ready when leaders return to room.
                </Li>
            </ul>

            <div style={{ animationDelay: "2400ms" }} className='w-full flex flex-col items-center animate__animated animate__fadeInUp mb-24'>

                <ReadyButton onReady={onReady} />

                {onForceReady && <div onClick={onForceReady} className='text-normal underline text-sm text-white mt-2 cursor-pointer'>Force next round</div>}
            </div>
        </div>
    )




}

function ReadyButton({ onReady, className = "" }) {
    const [clicked, setClicked] = useState(false);

    function handleClick() {
        onReady();
        setClicked(true);
    }


    return (<button onClick={!clicked ? handleClick : () => { }} className={'btn btn-wide mt-4 ' + (clicked ? "opacity-50 " : "  ") + className}>{clicked ? "Waiting..." : "Ready!"}</button>)
}


function Li({ children, title, delay = 0 }) {
    return (<div style={{ animationDelay: `${delay}ms` }} className=' animate__animated animate__fadeInUp bg-white text-black p-1.5 px-3 rounded-lg max-w-md w-full flex flex-col items-start'>
        <h1 className='font-bold text-2xl'>{title}</h1>
        <p className='text-sm font-light -mt-1.5'>{children}</p>
    </div>)
}



function RadialNumberAnnouncement({ number = 0 }) {
    return (
        <div style={{ animationDelay: "800ms" }} className='animate__animated animate__zoomIn w-28 h-28 relative'>
            <img style={{ animationDuration: "15s" }} className='opacity-10 w-full h-full animate-spin' src="/radial_blur.png" alt="" />
            <h1 className={'absolute inset-0 flex justify-center items-center text-6xl'}>{number}</h1>
        </div>
    )
}




function PauseGameNumberScreen({ meId, onClick = () => { }, player }) {

    const { setMenu } = useContext(PageContext);


    const [playerData, setPlayerData] = useState(player);
    const [card, setCard] = useState(getCardFromId(player?.card));
    const [playerChanged, setPlayerChanged] = useState(false);


    useEffect(() => {
        if (player.id !== playerData.id) {
            setPlayerChanged(true);
            setTimeout(() => {
                setPlayerData(player);
                setCard(getCardFromId(player?.card))
                setPlayerChanged(false);
            }, 1000)

        }
    }, [player])


    return (
        <div className='absolute inset-0 flex flex-col items-center justify-start pt-20 screen-bg-orange font-extrabold text-title text-white drop-shadow-md text-3xl gap-3 text-center overflow-y-scroll overflow-hidden scrollbar-hide'>

            <h2 style={{ animationDelay: "0ms" }} className='animate__animated animate__fadeInUp '>Announcements</h2>




            <h3 style={{ animationDelay: "800ms" }} className='animate__animated animate__fadeInUp text-normal text-lg font-semibold -mt-3 '>{meId === playerData?.id ? `You have pause game number ${card?.pausegamenr}` : `Pause game number ${card?.pausegamenr || 5}`}</h3>

            <h3 style={{ animationDelay: "1000ms" }} className='animate__animated animate__fadeInUp text-xs text-normal font-light -mt-3 '>(Rulebook page 10)</h3>


            <div style={{ animationDelay: (playerChanged ? "0ms" : "1600ms") }} className={'w-full flex flex-col items-center animate__animated ' + (playerChanged ? " animate__fadeOutUp " : " animate__fadeInUp ")}>


                {meId === playerData?.id ?
                    <div className='w-full flex flex-col p-4 items-center gap-4 font-normal'>
                        <CardFront onClick={() => {
                            setMenu(
                                <CardInfoMenu card={card} color={card.color} />
                            )
                        }} card={card} color={card.color} />
                        <button className='btn-accent btn btn-wide' onClick={onClick}>Next</button>
                    </div>
                    :
                    <div className='w-full flex flex-col items-center p-4 mt-8 gap-2'>

                        <div className='w-44 h-44 rounded-full border-4 border-white'>
                            <Avatar className="w-full h-full" {...playerData?.avaConfig} />
                        </div>
                        <h1 className=' truncate text-3xl'>{playerData?.name}</h1>
                        <h2 className='text-lg text-normal -mt-2'>...is presenting their card</h2>
                        <p className='text-lg text-normal'>🚫 Do not reveal your card to anyone yet.</p>



                        {meId?.toUpperCase() === "HOST" && <button className='text-normal font-light text-sm underline mt-6' onClick={onClick}>Force next</button>}

                    </div>
                }

            </div>


        </div>
    )









}





function RevealAllScreen({ onLobby, onClose, card, buriedCard }) {


    const { setMenu } = useContext(PageContext)


    return (
        <>
            <div className='screen-bg absolute z-20 inset-0' />
            <div className={" h-[100vh] w-[100vh] p-22 absolute rounded-full animate-left-to-right scale-[5] -top-[50vh] opacity-50 circular-gradient-secondary  z-20 "}></div>
            <div className={" h-[100vh] w-[100vh] p-22 absolute rounded-full animate-right-to-left scale-[5] -bottom-[50vh] opacity-50 circular-gradient-primary z-20 "}></div>


            <div className={'absolute inset-0 flex flex-col items-center justify-start pt-16 pb-32 font-extrabold text-title text-white drop-shadow-md text-4xl gap-3 text-center overflow-y-scroll overflow-hidden scrollbar-hide z-20 '}>



                <h2 style={{ animationDelay: "0ms" }} className='animate__animated animate__fadeInUp '>Game over!</h2>
                <h3 style={{ animationDelay: "600ms" }} className='animate__animated animate__fadeInUp text-2xl text-normal -mt-2 mb-1'>Reveal your card!</h3>

                <div style={{ animationDelay: "1200ms" }} className='animate__animated animate__fadeInUp my-6 font-normal'>
                    {card && <CardFront onClick={() => {
                        setMenu(
                            <CardInfoMenu card={card} color={card.color} />
                        )
                    }} card={card} color={card?.color} />}
                </div>

                {buriedCard && <div style={{ animationDelay: "2200ms" }} className=' animate__animated animate__fadeInUp flex items-center justify-center w-full gap-6 -my-4'>
                    <div className='text-title font-extrabold text-xl'>
                        BURIED CARD:
                    </div>
                    <div className='scale-[16%] -m-28 -my-40'>
                        <CardFront onClick={() => {
                            setMenu(
                                <CardInfoMenu card={buriedCard} color={buriedCard.color} />
                            )
                        }} card={buriedCard} color={buriedCard.color} />
                    </div>
                </div>}

                <div style={{ animationDelay: "3000ms" }} className='w-full flex flex-col items-center animate__animated animate__fadeInUp'>

                    {onLobby && <button onClick={onLobby} className='btn btn-wide btn-success text-title font-extrabold mt-6'>Return to lobby!</button>}
                    {onClose && <button onClick={onClose} className='underline text-normal text-sm mt-4' >Close game</button>}

                </div>

                {!onLobby && !onClose && <a style={{ animationDelay: "3000ms" }} href="/" className=" animate__animated animate__fadeIn underline text-normal font-normal text-sm mt-8 z-20 w-full text-center text-base-100">Leave</a>}

            </div>
        </>
    )




}


// Custom toasts

function CardRevealToast({ card, player }) {
    if (!card || !player) return (<></>)






    return (
        <div className='w-full max-w-md text-base-content bg-base-100 shadow grid grid-cols-[3rem_minmax(0,_1fr)] items-center justify-start rounded px-3 py-2'>
            <div className='card relative scale-[18%] -m-28 -my-40'><CardFront card={card} color={card?.color} /></div>
            <div className='w-full flex flex-col pl-2.5' onClick={() => setHidden(true)}>
                <div className='text-title font-extrabold opacity-70 text-xs w-full flex items-center'>
                    <TbPlayCard size={18} className='mr-1' /> <p>CARD REVEAL</p>
                </div>
                <div className='text-title font-extrabold text-sm sm:text-lg pl-1 w-full overflow-clip flex items-center justify-start gap-1.5 flex-nowrap whitespace-nowrap pr-2'><div className='truncate shrink'>{player?.name}</div> is <div style={{ color: card?.color?.primary }}>{card?.name}</div></div>
            </div>

        </div>
    )
}


function ColorRevealToast({ color, player }) {
    if (!color || !player) return (<></>)





    return (<div className='w-full max-w-md text-base-content bg-base-100 shadow grid grid-cols-[3rem_minmax(0,_1fr)] items-center justify-start rounded-xl p-2'>
        <div style={{ backgroundColor: color?.secondary, color: color?.primary }} className='h-12 w-12 rounded-lg text-xl flex items-center justify-center'>{<color.icon />}</div>
        <div className=' grow flex flex-col pl-3'>
            <div className='text-title font-extrabold opacity-70 text-xs w-full flex items-center'>
                <IoColorPaletteSharp size={18} className='mr-1' /> <p>COLOR REVEAL</p>
            </div>
            <div className='text-title font-extrabold text-sm sm:text-lg pl-1 w-full overflow-clip flex items-center justify-start gap-1.5 flex-nowrap whitespace-nowrap pr-2'><div className='truncate shrink'>{player?.name}</div> is in <div style={{ color: color?.primary }}>{color?.title}</div></div>
        </div>

    </div>
    )
}








export default GameView;
