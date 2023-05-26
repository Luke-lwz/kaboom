import { useContext, useEffect, useState } from 'react';
import { PageContext } from '../PageContextProvider';
import { Section } from './ChoosePlaysetMenu';
import PlayerList from '../PlayerList';
import PlaysetDisplay, { CardsRow } from '../playsets/PlaysetDisplay';
import { getPlaysetById } from '../../helpers/playsets';
import { getCardFromId } from '../../helpers/cards';
import Info from '../Info';

import { TbNotification } from "react-icons/tb";


function GameInfoMenu({ code, game, players, isHost, me, nextRound = () => { }, endRound = () => { }, execute = () => { } }) {

    const { devMode, setPrompt } = useContext(PageContext);


    const [cardsInGame, setCardsInGame] = useState([]);





    useEffect(() => {



        setCardsInGame(game.cardsInGame?.sort((a, b) => a?.id - b?.id).sort((a, b) => a?.[0] > b?.[0] ? 1 : -1)?.map(c => getCardFromId(c)) || [])

    }, [])



    function restartGame() {
        if (!devMode || !isHost) return
        localStorage.setItem(`game-${code}`, JSON.stringify({ ...game, phase: undefined, rounds: undefined, round: undefined, game: undefined }))
        window.location.href = window.location.href;
    }






    function closeAllConn() {
        if (!devMode || !isHost) return
        for (let pl of players) {
            if (pl?.conn) pl.conn.close();
        }
    }




    function pushNotif() {

        navigator.serviceWorker.register('/sw.js');
        const card = getCardFromId(me?.card);

        const circleIcon = coloredCircleForNotif(card?.color?.primary);


        coloredCardForNotif(card?.color?.primary, card?.src, cardIcon => {


            if (Notification && card) {
                Notification.requestPermission().then(perm => {
                    if (perm === "granted") {
                        navigator.serviceWorker.ready.then(function (registration) {






                            registration.showNotification(card?.color?.title || "error", {
                                tag: "KaboomCard",
                                body: "Click to reveal card.",
                                data: { ...card, color: { ...card?.color, icon: undefined }, info: undefined, cardIcon, circleIcon },
                                icon: circleIcon,
                                actions: [{action: "", title: card?.name}]
                            })

                            registration.getNotifications({ tag: "KaboomCard" }).then((notifications) => {
                                console.log(notifications)
                            });



                        })








                    }
                })
            }
        })





    }



    function coloredCircleForNotif(color, src) {
        var canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = 70;

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = color || "red";
        context.fill();




        return canvas.toDataURL('image/png');
    }



    function coloredCardForNotif(color, src, callback = () => { }) {
        var canvas = document.createElement('canvas');

        canvas.width = 200;
        canvas.height = 200;

        CanvasRenderingContext2D.prototype.roundedRectangle = function (x, y, width, height, rounded) {
            const radiansInCircle = 2 * Math.PI;
            const halfRadians = (2 * Math.PI) / 2;
            const quarterRadians = (2 * Math.PI) / 4;


            // top left arc
            this.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true);

            // line from top left to bottom left
            this.lineTo(x, y + height - rounded);

            // bottom left arc  
            this.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true);

            // line from bottom left to bottom right
            this.lineTo(x + width - rounded, y + height);

            // bottom right arc
            this.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true);

            // line from bottom right to top right
            this.lineTo(x + width, y + rounded);

            // top right arc
            this.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true);

            // line from top right to top left
            this.lineTo(x + rounded, y);
        }


        let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.roundedRectangle(30, 0, 140, 200, 10);
        ctx.fillStyle = color || "red";
        ctx.fill();



        if (src && src !== "") {
            var img = new Image;
            img.src = new URL("/cards" + src, import.meta.url).href
            img.onload = function () {
                ctx.drawImage(img, 30, 0, 140, 200); // Or at whatever offset you like
                
                callback(canvas.toDataURL('image/png'));
            };
        } else {
            

            callback(canvas.toDataURL('image/png'));

        }



    }




    return (
        <div className='w-full h-full bg-base-100 overflow-hidden flex flex-col items-center'>
            <h1 className='text-title font-extrabold text-2xl py-4 text-secondary shadow-2xl shadow-base-100 bg-base-200 w-full text-center '>{code}</h1>
            <div className='w-full h-full overflow-y-scroll overflow-x-hidden scrollbar-hide pt-3'>

                <div className='w-full px-4 py-2'>
                    <PlaysetDisplay noOpen playset={getPlaysetById(game.playsetId)} />
                </div>

                <div className='pt-0 flex flex-col justify-start items-start w-full shrink bg-base-100'>
                    <h1 className='px-4 text-xl font-extrabold text-neutral'>CARDS IN GAME</h1>
                    {game?.buriedCard && <p className='px-4 -mt-1 text-xs font-light text-neutral'>1 card is buried.</p>}

                    <div className='flex gap-6 py-2 pb-4 px-6 overflow-x-scroll w-full scrollbar-hide'>

                        <CardsRow cards={cardsInGame} />
                    </div>
                </div>

                {game.soberCard && <div className='pt-0 flex flex-col justify-start items-start w-full shrink bg-base-100'>
                    <div className='flex items-center gap-0'><h1 className='px-4 text-xl font-extrabold text-[#554180]'>SOBER CARD</h1><Info tooltip='Last round: Drunk player can switch to this card and acquire its abilities' /></div>


                    <div className='flex gap-6 py-2 pb-4 px-6 overflow-x-scroll w-full scrollbar-hide'>

                        <CardsRow cards={[getCardFromId(game?.soberCard)]} />
                    </div>
                </div>}

                <div className=' flex mt-2 flex-col justify-start items-start w-full shrink bg-base-100'>
                    <h1 className='text-xl px-4 font-extrabold text-neutral uppercase'>OPTIONS</h1>
                    <div className='bg-neutral/30 p-4 w-full flex items-center gap-4 overflow-x-scroll scrollbar-hide'>
                        <button className='btn btn-neutral noskew' onClick={() => { pushNotif() }}><span className='skew pr-2 text-xl'><TbNotification /></span> card notification</button>


                    </div>
                </div>


                {devMode && isHost && <div className=' flex mt-2 flex-col justify-start items-start w-full shrink bg-base-100'>
                    <h1 className='text-xl px-4 font-extrabold text-neutral uppercase'>Dev Options</h1>
                    <div className='bg-warning/30 p-4 w-full flex items-center gap-4 overflow-x-scroll scrollbar-hide'>
                        <button className='btn btn-warning noskew' onClick={() => { endRound(); nextRound(); }}>Skip round</button>
                        <button className='btn btn-warning noskew' onClick={() => restartGame()}>restart game</button>
                        <button className='btn btn-warning noskew' onClick={() => closeAllConn()}>close connections</button>
                        <button className='btn btn-warning noskew' onClick={() => execute("redirect-to-lobby")}>lobby</button>
                        <button className='btn btn-warning noskew' onClick={() => console.log(game)}>log game object</button>


                    </div>
                </div>}

                <div className='bg-neutral w-full h-fit border-neutral mt-2'>
                    <PlayerList players={players} me={me} showId showOnline={isHost} />
                </div>



            </div>

        </div>
    );
}

export default GameInfoMenu;