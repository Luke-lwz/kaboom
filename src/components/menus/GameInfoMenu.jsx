import { useContext, useEffect, useState } from 'react';
import { PageContext } from '../PageContextProvider';
import { Section } from './ChoosePlaysetMenu';
import PlayerList from '../PlayerList';
import PlaysetDisplay, { CardsRow } from '../playsets/PlaysetDisplay';
import { getPlaysetById } from '../../helpers/playsets';
import { getCardFromId } from '../../helpers/cards';

function GameInfoMenu({ code, game, getPlayers = () => [], isHost, me, nextRound = () => { }, endRound = () => { }, execute = () => {} }) {

    const { devMode, setPrompt } = useContext(PageContext);

    const [players, setPlayers] = useState(getPlayers());

    const [cardsInGame, setCardsInGame] = useState([]);


    useEffect(() => {

        if (isHost) {
            setInterval(() => setPlayers(getPlayers()), 2000)
        }


        setCardsInGame(game.cardsInGame?.sort((a,b) => a?.id - b?.id).sort((a, b) => a?.[0] > b?.[0] ? 1 : -1)?.map(c => getCardFromId(c)) || [])

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




    return (
        <div className='w-full h-full bg-base-100 overflow-hidden flex flex-col items-center'>
            <h1 className='text-title font-extrabold text-2xl py-4 text-secondary shadow-2xl shadow-base-100 bg-base-200 w-full text-center '>{code}</h1>
            <div className='w-full h-full overflow-y-scroll scrollbar-hide pt-3'>

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