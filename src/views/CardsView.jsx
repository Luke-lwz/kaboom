import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContext } from '../components/PageContextProvider';

// helpers
import { getAllCards, getCardFromId } from '../helpers/cards';

//icons
import { IoClose } from "react-icons/io5"

// components
import { CardFront } from '../components/Card';
import CardInfoMenu from '../components/menus/CardInfoMenu';
import Menu from '../components/Menu';
import { toast } from 'react-hot-toast';
import { DevModeBanner } from './HomeView';

import { useSearchParams } from 'react-router-dom'






function CardsView({ }) {

    const navigate = useNavigate();

    const { id } = useParams();

    const { setMenu, setOnMenuHide, devMode } = useContext(PageContext)

    const allCards = sortAllCards();

    const [focusedCard, setFocusedCard] = useState(null);
    const [visibleCards, setVisibleCards] = useState(allCards || []);
    const [search, setSearch] = useState("");

    let [searchParams, setSearchParams] = useSearchParams();


    useEffect(() => {
        const initParam = searchParams.get("s"); // initial search param
        setSearch(initParam || "")
        if (initParam && window?.history?.pushState) window?.history?.pushState({}, "", `/cards`)
    }, [])


    useEffect(() => {
        if (!id) return setFocusedCard(null);
        const card = getCardFromId(id);
        if (!card) {
            toast.error("Card not found")
            navigate("/cards", { replace: true })
        }
        else setFocusedCard(card);
    }, [id])

    useEffect(() => {
        if (focusedCard) {
            setTimeout(() => {
                setMenu(
                    <CardInfoMenu card={focusedCard} color={focusedCard.color} />
                );
                setOnMenuHide({ execute: onMenuHide })
            }, 100)
        }
    }, [focusedCard])


    useEffect(() => {
        filterVisibleCards(search)
        if (search) setSearchParams("s=" + search)
    }, [search])


    function sortAllCards() {
        const all = getAllCards();


        var allSorted = all.sort((a, b) => {
            return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
        });

        allSorted = allSorted.sort((x, y) => { return x.id == "r000" ? -1 : y.id == "r000" ? 1 : 0; }); // pushes certain elements to front
        allSorted = allSorted.sort((x, y) => { return x.id == "b000" ? -1 : y.id == "b000" ? 1 : 0; });
        allSorted = allSorted.sort((x, y) => { return x.id == "r001" ? -1 : y.id == "r001" ? 1 : 0; });
        allSorted = allSorted.sort((x, y) => { return x.id == "b001" ? -1 : y.id == "b001" ? 1 : 0; });

        allSorted = allSorted.sort((x, y) => { return x.id.startsWith("g") ? 1 : y.id.startsWith("g") ? -1 : 0; });
        allSorted = allSorted.sort((x, y) => { return x.id.startsWith("p") ? 1 : y.id.startsWith("p") ? -1 : 0; });
        allSorted = allSorted.sort((x, y) => { return x.id.startsWith("e") ? 1 : y.id.startsWith("e") ? -1 : 0; });
        allSorted = allSorted.sort((x, y) => { return x.id.startsWith("d") ? 1 : y.id.startsWith("d") ? -1 : 0; });

        return allSorted;
    }


    function onMenuHide() {
        navigate("/cards", { replace: true });
    }





    function filterVisibleCards(query) {
        if (query === "") return setVisibleCards(allCards)
        const q = query.toLowerCase()
        var cards = allCards.filter(card => {
            const oppoID = `${card.id[0] == "r" ? "b" : card.id[0] == "b" ? "r" : card.id[0]}${card.id.slice(-3)}`;
            if (checkText(getCardFromId(oppoID))) return true;

            // check links
            for (const id of card.links) {
                if (checkText(getCardFromId(id))) return true;
            }

            if (checkText(card)) return true;
            return false
        })






        function checkText(card) {
            if (card?.name?.toLowerCase()?.includes(q) || card?.description?.toLowerCase()?.includes(q) || card?.color?.title?.toLowerCase()?.includes(q) || card?.id?.toLowerCase()?.includes(q) || card?.tags?.toLowerCase()?.includes(q) || card?.color_name?.toLowerCase()?.includes(q)) return true;
            return false
        }


        // prioritise names starting with e
        cards = cards.sort((x, y) => { return x.name.toLowerCase().startsWith(q) ? -1 : y.name.toLowerCase().startsWith(q) ? 1 : 0; });



        setVisibleCards(cards);
    }



    return (
        <div className='flex flex-col justify-start items-center w-full h-full  overflow-x-hidden'>
            {devMode && <DevModeBanner />}
            <a href='/' className='text-title flex items-center justify-center gap-4 text-3xl mt-10 my-6 font-extrabold'>
                <span className='text-primary'>KABOOM</span>
                <span className=''>CARDS</span>
            </a>
            <Search value={search} onChange={(v) => setSearch(v)} />
            <div className='flex flex-wrap items-start justify-center gap-4 p-4 w-full overflow-y-scroll scrollbar-hide h-fit pt-0 pb-24 '>
                {visibleCards.map(card => <div key={card.id} onClick={() => navigate(`/cards/${card.id}`)} className='relative scale-[50%] overflow-hidden w-fit -mx-16 -m-24'>
                    <><CardFront key={card.id} card={card} color={card?.color} />{devMode ? <div className='text-2xl font-extrabold'>{card.id}</div> : ""}</>
                </div>)}
            </div>
        </div>
    );
}


function Search({ onChange = () => { }, value }) {
    return (
        <div className='bg-base-100 m-3 w-full max-w-xl rounded-lg flex justify-between items-center px-2 '>
            <input type="text" name="" id="" placeholder='Search' value={value} onChange={(e) => onChange(e.target.value)} className='p-1.5 w-full bg-base-200  rounded-lg text-sm px-3 font-semibold border-none outline-none overflow-x-hidden' />
            {value.length > 0 && <div onClick={() => onChange("")} className='px-2'><IoClose color={"#656565"} size="20" /></div>}
        </div>
    )
}

export default CardsView;