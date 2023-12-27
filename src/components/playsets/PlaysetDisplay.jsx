import { useContext, useEffect, useState, useMemo, useCallback } from "react";

//icons
import { BsFillPeopleFill, BsPencilFill } from "react-icons/bs";
import { BiError } from "react-icons/bi"
import { IoIosArrowDown } from "react-icons/io"


//components
import { CardFront } from "../Card";
import CardInfoMenu from "../menus/CardInfoMenu";
import { PageContext } from "../PageContextProvider";
import Info from "../Info";
import { PlaysetDisplayArea } from "./PlaysetAreas";
import { getCardColorFromId, getCardFromId, sortCards } from "../../helpers/cards";
import { getDifficultyDataFromValue } from "../../helpers/difficulty";
import Pill, { DifficultyPill, LargeRadialProgress, OfficialPill, VerifiedPill } from "../Pills";
import { allCardsInRow } from "../../helpers/playsets";
import { TbCards } from "react-icons/tb";
import { BiDownvote, BiUpvote, BiSolidDownvote, BiSolidUpvote } from "react-icons/bi";
import { BsStars } from "react-icons/bs"
import { FiExternalLink } from "react-icons/fi";
import { UserAvatar } from "../UserAvatars";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";




function PlaysetDisplay({ onClick = () => { }, playset, disabled = false, forceOpen = false, noOpen = false, showClosedPills = false, quickActions = { vote: true, remix: true, open: true, bookmark: true, profile: true } }) {

    const {
        profile
    } = playset || {};

    const { setMenu } = useContext(PageContext);


    console.log(quickActions)





    const [open, setOpen] = useState(forceOpen || false);


    const { cardCounts = [] } = useMemo(() => {
        if (!playset) return [];
        const cards = sortCards(allCardsInRow(playset));
        console.log(cards)
        let arr = [];

        for (const card of cards) {
            const { color_name, color } = card;
            const obj = {
                color_name,
                color: color.primary,
                count: 1,
            }

            const index = arr.findIndex(c => c.color_name === color_name);
            if (index !== null && arr[index]) arr[index].count++;
            else arr.push(obj);
        }

        return { cardCounts: arr };
    }, [playset])





    function toggleOpen() {
        if (noOpen) return setOpen(false);
        if (forceOpen) return setOpen(true);
        return setOpen(!open);
    }


    function getPlayerRange(range) {
        if (!range) return "error"
        var r = range?.split("-");

        if (r[0] === r[1]) return `${r[0]}`;
        return r.join(" - ");
    }

    return (
        <div className={"w-full transition-all overflow-y-hidden scrollbar-hide " + (open ? " h-48 " : showClosedPills ? " h-32 " : " h-32 ")}>
            <div className={"bg-black w-full relative h-14 overflow-hidden rounded-xl transition-all grow " + (disabled ? " grayscale opacity-60 " : " grayscale-0 opacity-100 ")}>
                <div style={{ background: `linear-gradient(65deg, #00000000, ${playset?.color || "#c342ff"}63, ${playset?.color || "#c342ff"}ab)` }} className="playset-gradient w-full absolute inset-0 opacity-50" />
                <div className="h-14 flex items-center absolute top-0 left-0 right-0 z-10">
                    <div onClick={onClick} className="flex items-center w-full h-14 pr-4">
                        <div className="h-full w-14 tooltip tooltip-right" data-tip={playset?.name}>
                            <EmojiHighlight emoji={playset?.emoji && playset?.emoji !== "" ? playset.emoji : undefined} />
                        </div>

                        <div className={"flex w-full shrink " + (forceOpen || noOpen ? " flex-row items-center justify-between text-lg " : " flex-col text-sm ")}>
                            <h1 className="text-title text-white font-bold truncate shrink w-[75%] text-left" >
                                {playset?.name}
                            </h1>
                            <div style={{ color: (playset?.color ? `${playset?.color}` : "#c342ff") }} className={"text-title text-xs items-center gap-2 flex  " + (forceOpen || noOpen ? " -ml-56 " : " ml-0 ")}>
                                <BsFillPeopleFill />
                                <h1 className=" whitespace-nowrap">{getPlayerRange(playset?.players)}</h1>
                            </div>
                        </div>
                    </div>


                    {!forceOpen && !noOpen && <div onClick={() => toggleOpen()} className="absolute top-0 right-0 bottom-0 w-14 flex items-center justify-center z-20">
                        <div className={"text-white text-2xl transition-all " + (!open ? " rotate-0 " : " rotate-180 ")}>
                            <IoIosArrowDown />
                        </div>
                    </div>}
                </div>
            </div>

            {showClosedPills && !open && <div className="flex items-center gap-2 py-2">
                {playset?.difficulty && <DifficultyPill difficulty={playset?.difficulty} />}
                {playset?.verified && <VerifiedPill />}
                {cardCounts?.map((c, i) => <Pill Icon={<TbCards />} key={i} textColor={c.color}>{c?.count}</Pill>)}
            </div>}


            {open && <div className="overflow-x-scroll flex gap-2 pt-2 w-full items-center overflow-y-hidden scrollbar-hide ">
                {playset?.primaries?.[0] && <PlaysetDisplayArea areaId={"primaries"}>
                    <CardsRow cards={playset?.primaries} />
                </PlaysetDisplayArea>}

                {playset?.cards?.[0] && <PlaysetDisplayArea areaId={"general"}>
                    <CardsRow cards={playset?.cards} />
                </PlaysetDisplayArea>}

                {playset?.odd_card && <PlaysetDisplayArea areaId={"odd"}>
                    <CardsRow cards={[playset?.odd_card]} />
                </PlaysetDisplayArea>}

                <PlaysetDisplayArea areaId={"default"}>
                    <CardsRow cards={playset?.default_cards || [getCardFromId("b000"), getCardFromId("r000")]} />
                </PlaysetDisplayArea>

                {playset?.difficulty && <DifficultyInPlayset difficulty={playset?.difficulty} />}

            </div>}


            {quickActions && <div className="flex items-center gap-2 py-2 px-4 -mt-1 justify-between w-full text-lg">
                {quickActions?.vote && <VoteComponent upvote={null} countWithoutMyVote={Math.floor(Math.random() * 10) - 1} />}
                {quickActions?.remix && <BsStars className="clickable hover:scale-105 hover:text-yellow-400 hover:rotate-[-365deg]" title="Remix" />}
                {quickActions?.open && <a target="_blank" href={`/playsets/${playset?.id}`}><FiExternalLink className="clickable hover:scale-105 hover:text-purple-600 " title="Open" /></a>}

                {quickActions?.bookmark && <BookmarkComponent bookmarked={true} onChange={() => { }} />}
                {quickActions?.profile && <button className="clickable flex gap-2 items-center group">
                    <UserAvatar profile={{ name: "lukas" }} className={"w-5 h-5 md:w-6 md:h-6 text-base"} />
                    {!profile && <p className="hidden md:block text-xs font-bold group-hover:underline max-w-[5rem] truncate">@{profile?.name || profile?.id}lolewfwefwef</p>}
                </button>}

            </div>}



        </div>
    )
}



function EmojiHighlight({ emoji = "🎲" }) {
    return (
        <div className="w-14 h-14 relative flex justify-center items-center text-2xl grow">
            <div className="white-blob-gradient absolute top-0 bottom-0 w-14 left-0 z-10" />
            <div className="absolute inset-0 z-20 flex justify-center items-center">
                {emoji}
            </div>
        </div>
    )
}





function DifficultyInPlayset({ difficulty }) {

    const difficultyData = useMemo(() => getDifficultyDataFromValue(difficulty), [difficulty])

    return (
        <div className="p-2  bg-grey-100 flex flex-col items-center justify-center gap-2">
            <LargeRadialProgress color={difficultyData?.colors?.primary} text={difficultyData?.difficulty} value={difficultyData?.difficulty * 10} />
            <Pill bgColor={difficultyData?.colors?.secondary} textColor={difficultyData?.colors?.primary}>{difficultyData?.name}</Pill>
        </div>
    )
}













function PlaysetDisplayOld({ onClick, playset, disabled = false, selected, showDisabledError = "bottom" }) {

    const { setMenu } = useContext(PageContext);




    return (
        <>
            {showDisabledError && showDisabledError === "top" && disabled && <WrongPlayerNumberPlayset />}
            <div className={"bg-base-200 flex flex-col w-full h-full overflow-hidden " + (onClick ? " clickable " : "") + (disabled ? " opacity-40 " : " opacity-100 ") + (selected ? " rounded-lg border-2 border-secondary scale-100 " : selected === false ? " border-0 rounded-lg " : " border-0 rounded-lg  ")}>
                <div onClick={(onClick ? onClick : () => { })} className=" p-4 pb-2">
                    <h1 className="text-title text-secondary text-lg font-bold truncate">
                        {playset?.name}
                    </h1>
                    <div className="text-title text-primary text-xs flex items-center gap-2">
                        <BsFillPeopleFill />
                        <h1>{playset?.players.split("-").join(" - ")}</h1>
                    </div>
                </div>
                <div className="overflow-x-scroll flex gap-6 px-5 py-3 pb-4 overflow-y-hidden">
                    <CardsRow cards={playset?.cards.filter(c => !c.id.endsWith("000"))} />
                    {playset?.odd_card && <div key={playset.odd_card.id} onClick={() => setMenu(<CardInfoMenu card={playset.odd_card} color={playset.odd_card.color} />)} className='card relative scale-[30%] -m-24 -my-36'><CardFront card={playset.odd_card} color={playset.odd_card?.color} /></div>}
                </div>
            </div>
            {showDisabledError && showDisabledError === "bottom" && disabled && <WrongPlayerNumberPlayset />}
        </>
    );
}


export function CardsRow({ cards }) {

    const { setMenu } = useContext(PageContext);


    return (cards.map((card, i) =>
        (card ? <div key={i} onClick={() => setMenu(<CardInfoMenu card={card} color={card.color} />)} className='card relative scale-[20%] -m-28 -my-40'><CardFront card={card} color={card?.color} /></div> : "")
    ))
}


export function WrongPlayerNumberPlayset() {
    return (
        <div className="text-error text-sm font-semibold flex items-center gap-2 my-1">
            <BiError />
            <h4>Insufficient number of players for playset</h4>
        </div>
    )
}





export function PlayWithBuryToggle({ bury, recommendBury, onChange = () => true, disabled }) {

    return (
        <>
            <div className="flex justify-between items-center w-full py-2">
                <div className="flex items-center gap-2">

                    <h1 className={"font-bold text uppercase " + (disabled ? " opacity-20 " : " opacity-100 ")}>Play with Card Burying </h1>
                    <Info tooltip="Influences the way cards are shuffled and distributed. (Rulebook page 12)" />
                </div>
                <input type="checkbox" className={"toggle toggle-success "} checked={bury} disabled={disabled} onChange={() => onChange(!bury)} />
            </div>
            {!disabled && <p className="text-sm font-light -mt-4">
                Recommended: <span className=" font-medium">{recommendBury ? " On " : " Off "}</span>
            </p>}
        </>
    )
}



export function VoteComponent({ upvote = null, countWithoutMyVote = 0, onChange = () => { } }) {


    const [vote, setVote] = useState(upvote);

    const count = useMemo(() => {
        var count = countWithoutMyVote;
        if (vote === true) count++;
        if (vote === false) count--;
        if (count < 0) count = 0;
        return count;
    }, [countWithoutMyVote, vote])

    useEffect(() => {
        setVote(upvote);
    }, [upvote])


    const onUpVote = useCallback(() => {
        var newVote = true
        if (vote === true) newVote = null;
        onChange(newVote);
        setVote(newVote)
    }, [vote])

    const onDownVote = useCallback(() => {
        var newVote = false
        if (vote === false) newVote = null;
        onChange(newVote);
        setVote(newVote)
    }, [vote])


    return (
        <>
            <div className="flex justify-start gap-3 items-center h-5">
                <button onClick={() => onUpVote()} className="clickable hover:scale-105">
                    {
                        vote === true ?
                            <BiSolidUpvote color="#fc021b" />
                            :
                            <BiUpvote className="text-accent" />
                    }

                </button>
                {!count ? <p className="text-accent">{"\u2022"}</p> : <p className="text-sm">{count}</p>}
                <button onClick={() => onDownVote()} className="clickable hover:scale-105">
                    {
                        vote === false ?
                            <BiSolidDownvote color="#0019fd" />
                            :
                            <BiDownvote className="text-accent" />
                    }
                </button>
            </div>
        </>
    )
}



function BookmarkComponent({ bookmarked, onChange }) {
    const [marked, setMarked] = useState(bookmarked);

    useEffect(() => {
        setMarked(bookmarked);
    }, [bookmarked])

    return (marked ?
        <IoBookmark className="text-info" onClick={() => {
            setMarked(!marked);
            onChange(!marked);
        }} />
        :
        <IoBookmarkOutline onClick={() => {
            setMarked(!marked);
            onChange(!marked);
        }} />
    )
}

export default PlaysetDisplay;