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
import { TbCards, TbShovel } from "react-icons/tb";
import { BiDownvote, BiUpvote, BiSolidDownvote, BiSolidUpvote } from "react-icons/bi";
import { BsStars } from "react-icons/bs"
import { FiExternalLink } from "react-icons/fi";
import { UserAvatar } from "../UserAvatars";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { FaGhost, FaTools } from "react-icons/fa";
import supabase from "../../supabase";
import toast from "react-hot-toast";



const GAP = 0.5;
const STANDARD_BLOCK_HEIGHT = 3.5;
const CARDS_BLOCK_HEIGHT = 5.25;
const PILLS_BLOCK_HEIGHT = 1.5;
const INTERACTION_ROW_BOCK_HEIGHT = 2 - GAP; // because row has no gap applied

function PlaysetDisplay({ onClick = () => { }, playset, disabled = false, forceOpen = false, noOpen = false, showPills = false, autoFetchInteractions = false, quickActions = { vote: true, workbench: true, open: true, bookmark: true, profile: true } }) {


    const { user, checkAuth } = useContext(PageContext);
    const {
        cards,
        default_cards,
        updated_at,
        primaries,
        odd_card,
        color,
        created_at,
        description,
        difficulty,
        downvote_count: downvote_count_object,
        upvote_count: upvote_count_object,
        emoji,
        id,
        name,
        force_bury,
        no_bury,
        interaction: interactions_array,
        max_players,
        min_players,
        playsets_metadata = {},
        remixed_from,
        shuffle,
        user_id,
    } = playset || {};




    const {
        verified = false,
        official = false,
        hidden = false,
    } = playsets_metadata || {};


    const [fetchedInteractions, setFetchedInteractions] = useState(false);

    useEffect(() => {
        if (user?.id, id, autoFetchInteractions) {
            fetchInteractions(user.id, id);
        }
    }, [user, id, autoFetchInteractions])

    async function fetchInteractions(user_id, playset_id) {
        const { data, error } = await supabase
            .from("interactions")
            .select("*")
            .eq("user_id", user_id)
            .eq("playset_id", playset_id)
            .limit(1)
            .single();
        if (error || !data) {
            toast.error("Error while fetching votes");
        } else {
            console.log(data);
            setFetchedInteractions(data);
        }


    }


    const { votes, myVote_default = 0, bookmarked_default = false } = useMemo(() => {
        if (!playset) return {};
        const downvote_count = downvote_count_object?.[0]?.count || 0;
        const upvote_count = upvote_count_object?.[0]?.count || 0;

        const interaction = interactions_array?.[0] || {};

        const {
            bookmark: bookmarked,
            upvote = null
        } = fetchedInteractions || interaction;

        let myVote = (upvote);


        const votes = upvote_count - downvote_count + (myVote === null ? 0 : myVote ? -1 : 1);




        return { votes, myVote_default: myVote, bookmarked_default: bookmarked };
    }, [playset, downvote_count_object, upvote_count_object, interactions_array, fetchedInteractions])


    const [open, setOpen] = useState(forceOpen || false);

    const [bookmarked, setBookmarked] = useState(bookmarked_default || false);
    const [myVote, setMyVote] = useState(myVote_default);

    useEffect(() => {
        setMyVote(myVote_default);
    }, [myVote_default])

    useEffect(() => {
        setBookmarked(bookmarked_default);
    }, [bookmarked_default])

    const height = useMemo(() => { // in rem
        if (!playset) return 0;


        const heightArray = [STANDARD_BLOCK_HEIGHT]

        if (open || forceOpen) heightArray.push(CARDS_BLOCK_HEIGHT);
        if (showPills) heightArray.push(PILLS_BLOCK_HEIGHT);
        if (quickActions) heightArray.push(INTERACTION_ROW_BOCK_HEIGHT);

        const height = heightArray.reduce(
            (accumulator, currentValue, currentIndex) => accumulator + currentValue + (currentIndex < heightArray.length - 1 ? GAP : 0),
            0,
        )

        return height;
    }, [playset, open, forceOpen, showPills, quickActions])

    const { cardCounts = [] } = useMemo(() => {
        if (!playset) return [];
        const cards = sortCards(allCardsInRow(playset));
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
        return setOpen(open => !open);
    }



    const handleVote = useCallback(async (vote) => {
        if (!user) return toast.error("You need to be logged in to vote");

        // optimistic
        var initalValue = vote;
        setBookmarked(v => {initalValue = v; return vote});

        const { data, error } = await supabase
            .from("interactions")
            .upsert({
                playset_id: id,
                user_id: user?.id,
                upvote: vote,
            })
            .select();

        if (error || !data?.[0]) {
            toast.error("Something went wrong");
            setMyVote(initalValue)
            return;
        } else {
            setMyVote(vote);
        }
    }, [id, user])


    const handleBookmark = useCallback(async (mark) => {
        if (!user) return toast.error("You need to be logged in to bookmark");

        // optimistic
        var initalValue = mark;
        setBookmarked(b => {initalValue = b; return mark});

        const { data, error } = await supabase
            .from("interactions")
            .upsert({
                playset_id: id,
                user_id: user?.id,
                bookmark: mark,
            })
            .select();
        if (error || !data?.[0]) {
            toast.error("Something went wrong");
            setBookmarked(initalValue);
            return;
        } else {
            setBookmarked(mark);
        }
    }, [id, user])


    return (
        <div style={{ height: `${height}rem` }} className={"w-full transition-all overflow-y-hidden scrollbar-hide flex flex-col items-center justify-start " + (hidden ? " opacity-50 " : " opacity-100 ")}>
            <TitleBlock {...{ name, max_players, min_players, emoji, color, remixed_from, hidden }} {...{ forceOpen, noOpen, open, onClick, toggleOpen }} />

            <div style={{ height: open ? `${CARDS_BLOCK_HEIGHT + GAP}rem` : 0 }} className="w-full overflow-hidden transition-all">
                {open && <CardsBlock {...{ difficulty, cards, primaries, odd_card, default_cards }} />}
            </div>
            {showPills && <PillsBlock {...{ difficulty, verified, official, cardCounts }} />}
            {quickActions && <InteractionRowBlock {...{ id, quickActions, votes, myVote, bookmarked }} onBookmarkedChange={(...arr) => checkAuth(() => handleBookmark(...arr))} onVoteChange={(...arr) => checkAuth(() => handleVote(...arr))} />}
        </div>
    )


}



// blocks 
function TitleBlock({ name, emoji = "🎲", min_players, max_players, remixed_from, hidden, forceOpen = false, noOpen = false, open = false, color, onClick = () => { }, toggleOpen = () => { } }) {

    // const DOT = () => <div className="w-1 h-1 bg-white/50 rounded-full"></div>

    return (
        <div className={"bg-black w-full relative h-14 pb-1 overflow-hidden rounded-xl transition-all grow flex-1 "}>
            <div style={{ background: `linear-gradient(65deg, #00000000, ${color || "#c342ff"}63, ${color || "#c342ff"}ab)` }} className="playset-gradient w-full absolute inset-0 opacity-50" />
            <div className="h-14 flex items-center absolute top-0 left-0 right-0 z-10">
                <div onClick={onClick} className="flex items-center w-full h-14 pr-4">
                    <div className="h-full w-14 tooltip tooltip-right relative" data-tip={name}>
                        <EmojiHighlight emoji={emoji && emoji !== "" ? emoji : undefined} />
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center z-30 translate-x-3 translate-y-2 text-lg">
                            {remixed_from && !hidden && <BsStars color="#fad623" className=" text-shadow rotate-3" />}
                            {hidden && <FaGhost color="#bdfcff" className=" text-shadow rotate-3" />}
                        </div>
                    </div>

                    <div className={"flex w-full shrink " + (forceOpen || noOpen ? " flex-row items-center justify-between text-lg " : " flex-col text-sm ")}>
                        <h1 className="text-title text-white font-bold truncate shrink w-[75%] text-left" >
                            {name}
                        </h1>
                        <div style={{ color: (color ? `${color}` : "#c342ff") }} className={"text-normal font-bold text-sm items-center gap-1 flex  " + (forceOpen || noOpen ? " -ml-56 " : " ml-0 ")}>
                            <BsFillPeopleFill />
                            <h1 className=" whitespace-nowrap font-extrabold">{min_players === max_players ? min_players : `${min_players}-${max_players}`}</h1>
                            {/* <DOT />
                            <TbShovel className="" /> */}
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
    )
}

function PillsBlock({ difficulty, verified, official, cardCounts }) {
    return (<div className="flex items-center gap-2 py-1 w-full overflow-x-scroll overflow-y-hidden scrollbar-hide">
        {difficulty && <DifficultyPill difficulty={difficulty} />}
        {verified && <VerifiedPill />}
        {official && <OfficialPill />}
        {cardCounts?.map((c, i) => <Pill Icon={<TbCards />} key={i} textColor={c.color}>{c?.count}</Pill>)}
    </div>)
}


function CardsBlock({ difficulty, cards, primaries, odd_card, default_cards }) {
    return (
        <div className="overflow-x-scroll flex gap-2 py-1 w-full items-center h- overflow-y-hidden scrollbar-hide ">
            {primaries?.[0] && <PlaysetDisplayArea areaId={"primaries"}>
                <CardsRow cards={primaries} />
            </PlaysetDisplayArea>}

            {cards?.[0] && <PlaysetDisplayArea areaId={"general"}>
                <CardsRow cards={cards} />
            </PlaysetDisplayArea>}

            <PlaysetDisplayArea areaId={"default"}>
                <CardsRow cards={default_cards || [getCardFromId("b000"), getCardFromId("r000")]} />
            </PlaysetDisplayArea>

            {odd_card && <PlaysetDisplayArea areaId={"odd"}>
                <CardsRow cards={[odd_card]} />
            </PlaysetDisplayArea>}


            {difficulty && <DifficultyInPlayset difficulty={difficulty} />}

        </div>
    )
}

function InteractionRowBlock({ id = "t0001", quickActions, votes, myVote, bookmarked, onBookmarkedChange = () => { }, onVoteChange = () => { } }) {

    const { smoothNavigate } = useContext(PageContext);

    var profile = {}; // temp
    return (
        <div className="flex items-center gap-2 px-4 justify-between w-full h-8 text-lg sm:text-base -translate-y-1">
            {quickActions?.vote && <VoteComponent upvote={myVote} onChange={onVoteChange} count={votes + (myVote === null ? 0 : (myVote ? 1 : -1))} />}
            {quickActions?.workbench && <FaTools onClick={() => smoothNavigate(`/workbench/${id}`)} className="clickable hover:scale-100 scale-[.80] hover:text-secondary hover:rotate-[-365deg]" title="Workbench" />}
            {quickActions?.open && <a target="_blank" href={`/playsets/${id}`}><FiExternalLink className="clickable hover:scale-105 hover:text-purple-600 " title="Open" /></a>}

            {quickActions?.bookmark && <BookmarkComponent bookmarked={bookmarked} onChange={onBookmarkedChange} />}
            {quickActions?.profile && <button className="clickable flex gap-2 items-center group">
                <UserAvatar profile={{ name: "lukas" }} className={"w-5 h-5 md:w-6 md:h-6 text-base"} />
                {!profile && <p className="hidden md:block text-xs font-bold group-hover:underline max-w-[5rem] truncate">@{profile?.name || profile?.id}lukas</p>}
            </button>}

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
        <div className="px-2  bg-grey-100 flex flex-col items-center justify-center gap-2">
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



export function VoteComponent({ upvote = null, count = 0, onChange = () => { } }) {




    const onUpVote = useCallback(() => {
        var newVote = true
        if (upvote === true) newVote = null;
        onChange(newVote);
    }, [upvote])

    const onDownVote = useCallback(() => {
        var newVote = false
        if (upvote === false) newVote = null;
        onChange(newVote);
    }, [upvote])


    return (
        <>
            <div className="flex items-center justify-between w-16">
                <button onClick={() => onUpVote()} className="clickable hover:scale-105">
                    {
                        upvote === true ?
                            <BiSolidUpvote color="#fc021b" />
                            :
                            <BiUpvote className="text-accent" />
                    }

                </button>
                {!count || count <= 0 ? <p className="text-accent font-bold">{"\u2022"}</p> : <p className="text-xs font-bold">{count}</p>}
                <button onClick={() => onDownVote()} className="clickable hover:scale-105">
                    {
                        upvote === false ?
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

    return (bookmarked ?
        <IoBookmark className="text-info hover:scale-105" onClick={() => {
            onChange(!bookmarked);
        }} />
        :
        <IoBookmarkOutline className="hover:scale-105" onClick={() => {
            onChange(!bookmarked);
        }} />
    )
}

export default PlaysetDisplay;