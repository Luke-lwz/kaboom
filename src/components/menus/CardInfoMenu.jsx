import { useContext, useEffect, useState } from 'react';

import { FiLink } from "react-icons/fi"
import { CardFront } from '../Card';
import { PageContext } from '../PageContextProvider';


import { getLinkedCards } from '../../helpers/cards';
import { WhiteDifficultyPill } from '../Pills';

function CardInfoMenu({ card, color, onCancel, onSelect, hideLinkedCards = false }) {

    const [linkedCards, setLinkedCards] = useState(getLinkedCards(card));

    const { setMenu, devMode } = useContext(PageContext);



    useEffect(() => {
        setLinkedCards(getLinkedCards(card))
    }, [card])





    return (
        <div className='w-full h-full flex items-center justify-center flex-col' >
            <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: color.secondary, color: color.text }} className='w-full max-w-[23rem] grow rounded-2xl flex flex-col items-center overflow-hidden bg-base-100 transition-all p-4 gap-4'>
                <div className='h-24 flex justify-start items-center w-full relative'>
                    <div style={{ backgroundColor: color.primary }} className='w-[3.5rem] h-24 overflow-hidden flex flex-col-reverse items-center justify-start rounded-lg'>
                        {card?.src && card.src !== "" && <img src={`/cards${card.src}`} alt="" className="w-full " />}

                    </div>
                    <div className='grow h-full flex flex-col justify-center items-start p-3'>
                        <h1 className='text-title text-2xl font-bold'>
                            {card.name}
                        </h1>
                        <div className='-mt-1 text-xs uppercase'>
                            {card.description}
                        </div>

                    </div>
                    {devMode && <div style={{ color: color.primary }} className='absolute top-1 right-2 text-xs'>{card.id.toUpperCase()}</div>}
                </div>
                <div className='flex items-center justify-start w-full -my-2'>
                    <WhiteDifficultyPill key={card?.id} difficulty={card?.difficulty} />

                </div>
                <div className='h-full w-full p-4 pb-2.5 text-lg flex flex-col overflow-y-scroll scrollbar-hide leading-5 bg-white text-black rounded-lg '>
                    {card.info.split("\n").map((t, i) => <div key={i}><p key={i}>{t}</p><div className='my-2 mb-0' /></div>)}
                </div>
                {card?.credit?.link && <a target="_blank" href={card?.credit?.link} className='text-xs underline -my-3'>
                    {card?.credit?.text || "Image credit"}
                </a>}
            </div>
            {!hideLinkedCards && linkedCards.length > 0 && <div className='w-full max-w-[23rem] m-12 flex items-center justify-start gap-4 relative'>
                <div className='absolute flex justify-start items-center'>
                    <div name="linked" className='rounded-full h-12 w-12 bg-base-100 m-4 flex justify-center items-center'><FiLink color={color.primary} size={24} /></div>
                    {linkedCards.map(card =>
                        (card ? <div key={card.id} onClick={(e) => setMenu(<CardInfoMenu card={card} color={card.color} onSelect={onSelect} />)} className='card relative scale-[20%] -m-24'><CardFront card={card} color={card?.color} /></div> : "")
                    )}
                </div>
            </div>}
            {onSelect && <div className='w-full flex items-center justify-center'>
                <button onClick={() => onSelect(card)} className='btn btn-success btn-wide text-title mt-2 text-white'>SELECT</button>
            </div>}
        </div>
    );
}

export default CardInfoMenu;