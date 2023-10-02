import "../cards.css"
import { useContext, useState, useEffect } from 'react';


import { motion } from "framer-motion";


import { PageContext } from "./PageContextProvider";
import CardInfoMenu from "./menus/CardInfoMenu";

import { BiError } from "react-icons/bi"
import { IoColorPaletteSharp } from "react-icons/io5"
import { TbPlayCard } from "react-icons/tb"




function Card({ card, hide, setHide, sendCard, allowColorReveal, remoteMode, onRemoteColorReveal, onRemoteCardReveal }) {


    const [cardInfo, setCardInfo] = useState(card || null);
    const [derender, setDerender] = useState(false);


    const { setMenu } = useContext(PageContext);

    const [drag, setDrag] = useState(0);


    useEffect(() => {
        if (card.id !== cardInfo.id) {
            setDerender(true);
            setTimeout(() => {
                setCardInfo(card);
                setDerender(false);
            }, 1000)
        } else setCardInfo(card);

    }, [card])


    function showSendCard() {
        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
        if (navigator.vibrate) {
            navigator.vibrate(25);
        }

        // show SendCard component
        sendCard(card)
    }


    function showCardInfo() {
        setMenu(
            <CardInfoMenu card={cardInfo} color={cardInfo.color} />
        )
    }


    return (
        <motion.div
            className="scrollbar-hide"
            drag="y"
            dragElastic={{ top: 0.5, bottom: 0 }}
            dragSnapToOrigin
            dragConstraints={{
                top: 0,
                bottom: 0.1,
            }}
            onDrag={
                (event, info) => {
                    setDrag(Math.floor(info.offset.y))
                }
            }
            onDragEnd={() => {
                if (drag < -70) {
                    showSendCard();
                }

                setDrag(0)
            }}
        >
            <div className={"flip-card relative animate__animated " + (derender ? " animate__bounceOutUp " : " animate__bounceInDown ")}>

                <div className={"absolute w-full flex justify-center items-center gap-2 z-10 transition-all rounded-xl -bottom-11 "}>
                    <button onClick={() => showCardInfo()} style={{ backgroundColor: cardInfo.color.primary }} className={" h-7 text-sm font-bold text-white px-3 py-1 rounded-full transition-all duration-500 delay-400 " + (hide ? " opacity-0 -translate-y-14 " : " opacity-100 -translate-y-0 ")}>
                        More info
                    </button>

                    <button onClick={() => onRemoteCardReveal()} style={{ backgroundColor: cardInfo.color.primary }} className={" h-7 text-sm font-bold text-white px-3 py-1 rounded-full transition-all duration-500 delay-200 flex items-center justify-center " + (hide || !remoteMode ? " opacity-0 -translate-y-14 " : ` opacity-100 -translate-y-0 `) + (remoteMode ? " w-10 " : " w-0 -mx-4 ")}>
                        <TbPlayCard size={16} />
                    </button>

                    <button onClick={() => onRemoteColorReveal()} style={{ backgroundColor: cardInfo.color.primary }} className={" h-7 text-sm font-bold text-white px-3 py-1 rounded-full transition-all duration-500 delay-300 flex items-center justify-center " + (hide || !remoteMode || !allowColorReveal ? " opacity-0 -translate-y-14 " : ` opacity-100 -translate-y-0 `) + (remoteMode && allowColorReveal ? " w-10 " : " w-0 -mx-4 ")}>
                        <IoColorPaletteSharp size={16} />
                    </button>
                </div>



                <div className={"flip-card-inner absolute inset-0 z-20 " + (hide ? " show-card " : "")}>
                    <div className={"flip-card-front transition-all duration-[200ms] delay-150 rounded-xl overflow-hidden" + (hide ? " opacity-0 " : "  ")}>
                        <CardFront card={cardInfo} color={cardInfo.color} onClick={() => setHide(true)} />
                    </div>
                    <div className="flip-card-back rounded-xl overflow-hidden">
                        <CardBack allowColorReveal={allowColorReveal} color={cardInfo.color} onClick={() => setHide(false)} />
                    </div>

                </div>




            </div>


        </motion.div>
    );
}


export function CardFront({ onClick = () => { }, color, card }) {



    return (
        <C onClick={onClick} color={color} >
            <div className="absolute inset-0 rounded-xl overflow-hidden flex flex-col justify-start z-30">
                <div className="flex flex-row justify-start items-center w-full h-5/6">
                    <div style={{ backgroundColor: color?.primary }} className="w-9/12 h-full flex flex-col-reverse items-center">
                        {card?.src && card.src !== "" && <img src={`/cards${card.src}`} alt="" className="w-full " />}
                    </div>
                    <div className="upright-text flex flex-col justify-start items-start w-3/12 h-full p-1.5 pt-2.5">
                        <div className="text-xs -ml-0.5 text-normal">You are the</div>
                        <div className="text-xl font-extrabold uppercase text-title -ml-0.5">{card.name}</div>

                        <div className="text-xs uppercase text-normal">{card.description}</div>

                    </div>
                </div>
                <div className="w-full flex flex-row justify-between items-center h-1/6">
                    <h1 className={"text-title h-full w-9/12 flex justify-center items-center p-2 font-extrabold uppercase " + (color?.title?.length < 10 ? " text-2xl " :  " text-xl ")}>
                        {color?.title}
                    </h1>
                    <div className="w-3/12 flex items-center justify-center text-2xl">
                        {color?.icon && <color.icon color={color?.primary || ""} />}
                    </div>
                </div>
            </div>
        </C>
    )
}

export function CardBack({ onClick = () => { }, color, allowColorReveal }) {

    const [drag, setDrag] = useState(0);
    const [colorReveal, setColorReveal] = useState(false);




    useEffect(() => {
        if (drag >= 180 && !colorReveal && allowColorReveal) {
            setColorReveal(true);
            navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
            if (navigator.vibrate) {
                // vibration API supported
                navigator.vibrate(25);
            }
        }
        else if (drag < 180 && colorReveal) setColorReveal(false);
    }, [drag])


    return (

        <C onClick={onClick}>
            <div style={{ backgroundColor: (colorReveal ? color.secondary : `#000000`) }} className=" absolute inset-0 rounded-xl overflow-hidden">
                <div style={{ transform: `translateY(${drag / 5.5}px)`, color: "#ffffff" }} className="text-title w-full text-center text-md overflow-hidden">
                    <h1 style={{ transform: `scale(${(colorReveal ? "135%" : "100%")})`, transitionProperty: "transform", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms" }} className="">
                        {colorReveal ?
                            <div className="flex justify-center items-center gap-3 p-1.5">
                                <color.icon color={color?.primary || ""} size={22} />
                                <h1>{color.title}</h1>
                            </div> :
                            allowColorReveal ?
                                "COLOR REVEAL"
                                :
                                <div className="flex justify-center items-center gap-3 p-1.5 text-error">
                                    <BiError size={22} />
                                    <h1 className="text-white">DISABLED</h1>
                                </div>
                        }
                    </h1>
                </div>
            </div>
            <motion.div
                onDrag={
                    (event, info) => {
                        setDrag(Math.floor(info.offset.y))

                    }
                }
                onDragEnd={() => setTimeout(() => setDrag(0), 500)}
                className="h-full w-full flex items-center justify-center overflow-hidden rounded-xl bg-accent absolute inset-0"
                drag="y"
                dragElastic={{ top: 0, bottom: 0.5 }}
                dragSnapToOrigin
                dragConstraints={{
                    top: 0.1,
                    bottom: 0,
                }}>
                <div className='text-title text-base-100 text-5xl scale-[150%] h-full w-full flex justify-center items-center overflow-hidden -rotate-[5deg] relative '>
                    <div className="scrolling-image w-full h-full overflow-hidden" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center rotate-[5deg] text-title text-xl overflow-hidden ">
                        <h1 className="logo-gradient-neutral w-full h-1/2 flex items-center justify-center overflow-hidden">KABOOM</h1>
                    </div>
                </div>
            </motion.div>



        </C>
    )


}


export function C({ onClick = () => { }, color = { primary: "#888888", secondary: "#888888" }, children }) {

    return (
        <div onClick={onClick} style={{ width: "16rem", height: "24rem", backgroundColor: color.secondary, color: color.text || "#ffffff" }} className={' d3   rounded-xl flex flex-col justify-center items-center inner-shadow drop-shadow-xl'}>
            {children}
        </div>
    )
}




export default Card;