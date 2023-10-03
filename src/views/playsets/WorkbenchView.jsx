
import { useState, useContext, useCallback, useMemo, useEffect } from "react"

// icons
import { FaTools, FaBomb } from "react-icons/fa"
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { MdOutlineClose } from "react-icons/md"
import { RiSpeedUpFill } from "react-icons/ri"
import { GiSwordwoman } from "react-icons/gi"




import LinkedCardsContainer from "../../components/LinkedCardsContainer";
import { getAllCards, getCardFromId, getCardsForPlayset, getLinkedCardsPaired, getLinkedCardsPairedById } from "../../helpers/cards";
import { avgFromCards, getDifficultyDataFromValue } from "../../helpers/difficulty";
import { PageContext } from "../../components/PageContextProvider";
import CardInfoMenu from "../../components/menus/CardInfoMenu";
import { WorkbenchPlaysetArea } from "../../components/playsets/PlaysetAreas";
import Pill, { DifficultyPill } from "../../components/Pills";
import CardsFilter from "../../components/CardsFilter";
import PlaysetDisplay from "../../components/playsets/PlaysetDisplay";

import Picker from 'emoji-picker-react';
import { getPlaysetArea } from "../../helpers/playset-areas";
import RangeCounter from "../../components/RangeCounter";



const MIN = {
    primaries: 2,
    generalCards: 0,
    oddCard: 0,
    defaultCards: 2
}
const MAX = {
    primaries: 3,
    generalCards: 1000,
    oddCard: 1,
    defaultCards: 2
}



export default function WorkbenchView(props) {

    const { setMenu, setPageCover } = useContext(PageContext);

    const [primaries, setPrimaries] = useState([
        ["b001", "r001"],
    ])
    const [generalCards, setGeneralCards] = useState([
        ["b014", "r014"],
    ])
    const [oddCard, setOddCard] = useState("g008"); // nullable
    const [defaultCards, setDefaultCards] = useState([
        ["b000", "r000"],
    ])


    // Form 
    const [emoji, setEmoji] = useState("🎲");
    const [name, setName] = useState("My Playset");







    const playset = useMemo(() => ({
        name,
        players: "7-30",
        emoji,
        primaries: crackOpenPairs(primaries).map((cid) => getCardFromId(cid)),
        cards: crackOpenPairs(generalCards).map((cid) => getCardFromId(cid)),
        default_cards: crackOpenPairs(defaultCards).map((cid) => getCardFromId(cid)),
        odd_card: oddCard ? getCardFromId(oddCard) : null,
        shuffle: true,
        no_bury: false
    }), [primaries, generalCards, oddCard, defaultCards, emoji, name])

    const allCardsInPlaysetInRowId = useMemo(() => {
        var allCardsIds = [];

        primaries.forEach(cardPair => {
            allCardsIds = [...allCardsIds, ...cardPair]
        })
        generalCards.forEach(cardPair => {
            allCardsIds = [...allCardsIds, ...cardPair]
        })
        defaultCards.forEach(cardPair => {
            allCardsIds = [...allCardsIds, ...cardPair]
        })
        if (oddCard) allCardsIds.push(oddCard);


        return allCardsIds
    }, [primaries, generalCards, oddCard, defaultCards])



    // events
    function onCardSetInfo(card) {
        setMenu(<CardInfoMenu card={card} color={card?.color} />)
    }


    // functions
    function crackOpenPairs(pairs) { // makes 1d array from 2d array
        var cracked = [];
        pairs.forEach(cardPair => {
            cracked = [...cracked, ...cardPair]
        })

        return cracked;
    }

    function removeAtIndex(arr, index) {
        return arr.filter((value, i) => i !== index);
    }






    // useCallback functions








    // select
    function onPrimaryCardsClick(clickedIndex) {
        var primaryCards = getAllCards()?.filter(card => card?.primary && !allCardsInPlaysetInRowId.includes(card?.id));
        setPageCover({
            title: "Select primary",
            element: <CardsFilter paired showDifficulty onClick={replaceOrAddCard} filter={{ visibleCards: primaryCards.map(c => c?.id) }} />,
            onClose: () => setPageCover(null)
        })


        function replaceOrAddCard(card) {
            var cardsIdsPair = getLinkedCardsPaired(card)?.map(c => c?.id);

            if (clickedIndex !== undefined && clickedIndex !== null) { // replace at this index
                setPrimaries(primaries => {
                    primaries[clickedIndex] = cardsIdsPair;
                    return JSON.parse(JSON.stringify(primaries));
                })
            } else { // add new
                setPrimaries(primaries => {
                    return [...primaries, cardsIdsPair]
                });

            }
            setPageCover(null)
        }
    }

    function onGeneralCardsClick(clickedIndex) {
        var applicableCards = getAllCards()?.filter(card => !card?.primary);
        setPageCover({
            title: "General cards",
            element: <CardsFilter paired showDifficulty onClick={replaceOrAddCard} filter={{ visibleCards: applicableCards.map(c => c?.id) }} />,
            onClose: () => setPageCover(null)
        })


        function replaceOrAddCard(card) {
            var cardsIdsPair = getLinkedCardsPaired(card)?.map(c => c?.id);

            if (clickedIndex !== undefined && clickedIndex !== null) { // replace at this index
                setGeneralCards(generalCards => {
                    generalCards[clickedIndex] = cardsIdsPair;
                    return JSON.parse(JSON.stringify(generalCards));
                })
            } else { // add new
                setGeneralCards(generalCards => {
                    return [...generalCards, cardsIdsPair]
                });

            }
            setPageCover(null)
        }
    }

    function onOddCardClick() {
        var applicableCards = getAllCards()?.filter(card => !card?.primary && card?.links?.length <= 0 && !["red", "blue"].includes(card?.color_name));
        setPageCover({
            title: "Odd card",
            element: <CardsFilter paired showDifficulty onClick={replaceOrAddCard} filter={{ visibleCards: applicableCards.map(c => c?.id) }} />,
            onClose: () => setPageCover(null)
        })


        function replaceOrAddCard(card) {
            setOddCard(card?.id)
            setPageCover(null)
        }
    }

    function onDefaultCardsClick() {
        var applicableCards = getAllCards()?.filter(card => !card?.primary && (["red", "blue"].includes(card?.color_name)));
        setPageCover({
            title: "Default cards",
            element: <CardsFilter paired showDifficulty onClick={replaceOrAddCard} filter={{ visibleCards: applicableCards.map(c => c?.id) }} />,
            onClose: () => setPageCover(null)
        })


        function replaceOrAddCard(card) {
            setDefaultCards(JSON.parse(JSON.stringify([getLinkedCardsPaired(card)?.map(c => c?.id)])))
            setPageCover(null)
        }
    }


    return (
        <div className="flex flex-col md:flex-row w-full h-full overflow-x-hidden overflow-y-scroll scrollbar-hide ">


            <div className="w-full md:max-w-md xl:max-w-xl flex flex-col items-start justify-start grow border-neutral/10 border-b md:border-r">  {/* Left Bar With linked cards box */}


                <div className="shadow-xl shadow-base-100">
                    <TitleBar titleElement={
                        <>
                            <FaTools />
                            <h1>Workbench</h1>
                        </>
                    } />
                </div>
                <div className="w-full md:overflow-x-hidden md:overflow-y-scroll gap-4 p-4 md:pb-20 flex flex-col">


                    <WorkbenchPlaysetArea
                        areaId="primaries"
                        min={MIN.primaries}
                        max={MAX.primaries}
                        cardCount={crackOpenPairs(primaries)?.length || 0}
                        onAdd={() => onPrimaryCardsClick(null)}>

                        {primaries.map((cardsIds, i) => <WorkbenchLinkedCards
                            onX={() => setPrimaries(primaries => removeAtIndex(primaries, i))}
                            onClick={() => onPrimaryCardsClick(i)}
                            onInfo={onCardSetInfo}
                            key={"primary-" + i + cardsIds?.[0]?.id} id={cardsIds[0]} />)}

                    </WorkbenchPlaysetArea>

                    <WorkbenchPlaysetArea
                        areaId="general"
                        min={MIN.generalCards}
                        max={MAX.generalCards}
                        cardCount={crackOpenPairs(generalCards)?.length || 0}
                        onAdd={() => onGeneralCardsClick(null)}>

                        {generalCards.map((cardsIds, i) => <WorkbenchLinkedCards
                            onX={() => setGeneralCards(generalCards => removeAtIndex(generalCards, i))}
                            onClick={() => onGeneralCardsClick(i)}
                            onInfo={onCardSetInfo}
                            key={"general-" + i + cardsIds?.[0]?.id}
                            id={cardsIds[0]} />)}

                    </WorkbenchPlaysetArea>

                    <WorkbenchPlaysetArea
                        areaId="odd"
                        min={MIN.oddCard}
                        max={MAX.oddCard}
                        cardCount={oddCard ? 1 : 0}
                        onAdd={() => onOddCardClick()}>

                        {oddCard && <WorkbenchLinkedCards
                            onX={() => setOddCard(null)}
                            onClick={() => onOddCardClick()}
                            onInfo={onCardSetInfo}
                            key={"odd-card"}
                            id={oddCard} />}

                    </WorkbenchPlaysetArea>

                    <WorkbenchPlaysetArea
                        areaId="default"
                        min={MIN.defaultCards}
                        max={MAX.defaultCards}
                        cardCount={crackOpenPairs(defaultCards)?.length || 0}
                        onAdd={() => onDefaultCardsClick()} >

                        {defaultCards.map((cardsIds, i) => <WorkbenchLinkedCards
                            onX={() => setDefaultCards(defaultCards => removeAtIndex(defaultCards, i))}
                            onClick={() => onDefaultCardsClick()}
                            onInfo={onCardSetInfo}
                            key={"general-" + i + cardsIds?.[0]?.id}
                            id={cardsIds[0]} />)}

                    </WorkbenchPlaysetArea>


                </div>



            </div>




            <div className="p-4 grow md:overflow-x-hidden md:overflow-y-scroll scrollbar-hide pb-32 gap-4 flex flex-col items-center">
                <PlaysetDisplay key={playset?.name} forceOpen playset={playset} />
                <div className="w-full flex items-center gap-2 text-center">
                    <div className="dropdown input p-0 rounded-md">
                        <label tabIndex={0} className="w-16 h-full flex items-center justify-center">{playset?.emoji}</label>
                        <div tabIndex={0} className="dropdown-content">
                            <Picker onEmojiClick={(data) => setEmoji(data?.emoji || "🎲")} emojiStyle="native" categories={["smileys_people", "animals_nature", "food_drink", "travel_places", "activities", "objects", "symbols"]} />
                        </div>
                    </div>
                    <input type="text" placeholder="Name" className="input w-full rounded-md" value={name} onChange={(e) => setName(e?.target?.value || "")} />
                </div>
                <h1 className="font-extrabold w-full text-lg mt-4 text-center">Simulate Game</h1>
                <PlaysetSimulator playset={playset} />
            </div>

        </div>
    );
}




export function PlaysetSimulator({ playset }) {

    const [playerCount, setPlayerCount] = useState(11);

    const { cards, soberCard } = useMemo(() => {
        return getCardsForPlayset({ playset, players: Array(playerCount).fill(0), playWithBury: false })
    }, [playset, playerCount])




    return (
        <div className="w-full flex flex-col items-center">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center w-fit gap-2 text-lg">
                    <h3 className="font-semibold">Players</h3>
                    <RangeCounter value={playerCount} onChange={setPlayerCount} min={6} max={1000} />
                </div>
                <button>Reset</button>
            </div>
            <div className="w-full flex-wrap flex border-2 border-neutral rounded-xl gap-2 p-2">

                {playset?.primaries?.map((card, i) => <ShuffledInCardDummy disabled={!cards.includes(card?.id) && !soberCard !== card?.id} key={card?.id + i} card={card} areaId="primaries" />)}
                {playset?.cards?.map((card, i) => <ShuffledInCardDummy disabled={!cards.includes(card?.id) && !soberCard !== card?.id} key={card?.id + i} card={card} areaId="general" />)}
                {playset?.odd_card && <ShuffledInCardDummy disabled={!cards.includes(playset?.odd_card?.id) && !soberCard !== playset?.odd_card?.id} key={playset?.odd_card?.id} card={playset?.odd_card} areaId="odd" />}
                {playset?.default_cards?.map((card, i) => <ShuffledInCardDummy disabled={!cards.includes(card?.id) && !soberCard !== card?.id} key={card?.id + i} card={card} areaId="default" />)}
            </div>
        </div>
    )
}


// Simulator components

export function ShuffledInCardDummy({ card, areaId, disabled = false }) {
    const area = useMemo(() => getPlaysetArea(areaId || "odd"), [areaId]);

    return (
        <div className={"bg-black rounded-md overflow-hidden w-fit h-fit transition-all group " + (disabled ? " scale-75 " : " scale-100 ")}>
            <div style={{ backgroundColor: card?.color?.primary }} className={"text-white flex items-center justify-center flex-col relative aspect-[2/3] w-10 transition-all " + (disabled ? " opacity-50 " : " opacity-100 ")}>
                <area.icon className="opacity-0 group-hover:opacity-100 transition-all" />
                {card?.src && card?.src !== "" && <img src={`/cards${card.src}`} className="opacity-100 group-hover:opacity-0 transition-all absolute inset-0" />}
            </div>
        </div>

    )
}





// End Simulator Components


export function WorkbenchLinkedCards({ id, onInfo = (card) => { }, onClick = () => { }, onX = () => { } }) {

    const cards = useMemo(() => getLinkedCardsPairedById(id), [id])
    const averageDifficulty = useMemo(() => avgFromCards(cards), [cards])
    // const difficultyData = getDifficultyDataFromValue(averageDifficulty)

    return (
        <div className="flex flex-col items-start justify-start w-full h-fit gap-1">
            <div className="flex items-center justify-start h-36 w-full">
                <LinkedCardsContainer cards={cards} onClick={onClick} />
                <div className="w-12 p-2 h-full flex flex-col items-center justify-center">
                    <ActionCircle onClick={() => onX()} icon={<MdOutlineClose />} />
                    <ActionCircle onClick={() => onInfo(cards[0])} icon={<AiOutlineInfoCircle />} />
                </div>
            </div>
            <div className="overflow-x-scroll scrollbar-hide flex items-center">
                {/* {difficultyData && <Pill Icon={GiSwordwoman} bgColor={difficultyData?.colors?.secondary} textColor={difficultyData?.colors?.primary} tooltip={difficultyData?.difficulty}>{difficultyData?.name}</Pill>} */}
                <DifficultyPill difficulty={averageDifficulty} />
            </div>
        </div>
    )
}



export function ActionCircle({ onClick, icon, tooltip, hidden = false }) {
    return (
        <div onClick={onClick} className={" rounded-full bg-neutral flex items-center justify-center text-neutral-content clickable " + (tooltip && " tooltip ") + (hidden ? " h-0 w-0 my-0 " : " h-8 w-8 my-1 ")} data-tip={tooltip}>
            {icon}
        </div>
    )
}


export function TitleBar({ titleElement, fixed }) {
    return (
        <div className={"flex items-center h-14 p-4 z-10 justify-start w-full text-xl md:text-2xl font-extrabold text-title transition-all " + (fixed && " fixed top-0 left-0 right-0 ")}>
            <a href="/" className="flex items-center justify-end text-primary mr-4 h-full cursor-pointer">
                <FaBomb className="mr-4 sm:hidden block" size={25} />
                <h1 className="hidden sm:inline-block pr-4 ">KABOOM</h1>
                <VerticalDivider />
            </a>
            <div className="flex items-center justify-start gap-3 text-secondary">
                {titleElement}
            </div>
        </div>
    )



}


export function VerticalDivider() {
    return (
        <div className="h-full p-[1px] rounded-full bg-neutral/20" />
    )
}






