import { useState, useEffect } from 'react';
import { getAllCards, getCardColorFromColorName, getCardFromId, CARD_COLOR_ORDER, getLinkedCardsPaired } from '../helpers/cards';
import { CardFront } from './Card';
import LinkedCardsContainer from './LinkedCardsContainer';
import { DifficultyPill } from './Pills';
import { avgFromCards } from '../helpers/difficulty';


const SEARCH_PILLS = [
    {
        title: "Version 2",
        searchValue: "v2"
    },
    {
        title: "Version 1",
        searchValue: "v1"
    },
    {
        title: "Official",
        searchValue: "official"
    },
    ...CARD_COLOR_ORDER.map(color => {
        return {
            title: color[0].toUpperCase() + color.slice(1),
            searchValue: color,
            style: {
                borderColor: getCardColorFromColorName(color)?.primary || "",
                color: getCardColorFromColorName(color)?.primary || ""
            }
        }
    }),
    {
        title: "Necroboomicon",
        searchValue: "necroboomicon",
        style: {
            borderColor: "#9cde47",
            color: "#9cde47"
        }
    }

]

export default function CardsFilter({ defaultSearch = "", onSearchUpdate = () => { }, onClick = () => { }, searchContainerClassName = "", paired = false, showDifficulty = false, filter = {visibleCards: undefined, hiddenCards: undefined} }) {



    const allCards = sortAllCards();

    const [visibleCards, setVisibleCards] = useState(allCards || []);
    const [searchFocused, setSearchFocused] = useState(false);
    const [search, setSearch] = useState(defaultSearch);

    const [pairedCards, setPairedCards] = useState(paired ? pairUpCards(allCards) || [] : []);






    useEffect(() => {
        if (defaultSearch) filterVisibleCards(defaultSearch)
        if (defaultSearch && paired) filterVisiblePairedCards(defaultSearch);

    }, [])



    function handleSearchUpdate(value) {
        filterVisibleCards(value)
        if (paired) filterVisiblePairedCards(value);

        setSearch(value);
        onSearchUpdate(value)
    }






    // functions
    function sortAllCards() {
        let all = getAllCards();

        if (filter?.visibleCards) all = all.filter(card => filter?.visibleCards?.includes(card?.id)); // only shows cards that are specified in prop "filter.visibleCards"
        if (filter?.hiddenCards) all = all.filter(card => !filter?.hiddenCards?.includes(card?.id));

        var allSorted = all.sort((a, b) => {
            return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
        });

        allSorted = allSorted.sort((x, y) => { return x.id == "r000" ? -1 : y.id == "r000" ? 1 : 0; }); // pushes certain elements to front
        allSorted = allSorted.sort((x, y) => { return x.id == "b000" ? -1 : y.id == "b000" ? 1 : 0; });
        allSorted = allSorted.sort((x, y) => { return x.id == "r001" ? -1 : y.id == "r001" ? 1 : 0; });
        allSorted = allSorted.sort((x, y) => { return x.id == "b001" ? -1 : y.id == "b001" ? 1 : 0; });

        for (let i = 0; i < CARD_COLOR_ORDER.length; i++) {
            let colorName = CARD_COLOR_ORDER[i];
            if (!["blue", "red"].includes(colorName)) {
                allSorted = allSorted.sort((x, y) => { return x.color_name === colorName ? 1 : y.color_name === colorName ? -1 : 0; });
            }

        }

        return allSorted;
    }


    function filterVisibleCards(query) {
        if (query === "") return setVisibleCards(allCards)
        const q = query.toLowerCase()
        var cards = allCards.filter(card => {

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

    function filterVisiblePairedCards(query) {
        let pairedCards = pairUpCards(allCards)
        if (query === "") return setPairedCards(pairedCards)
        const q = query.toLowerCase()
        var cardPairs = pairedCards.filter(cardPair => {

            for (let i = 0; i < cardPair?.length || 0; i++) {
                if (checkText(cardPair[i])) return true;
            }
            return false
        })






        function checkText(card) {
            if (card?.name?.toLowerCase()?.includes(q) || card?.description?.toLowerCase()?.includes(q) || card?.color?.title?.toLowerCase()?.includes(q) || card?.id?.toLowerCase()?.includes(q) || card?.tags?.toLowerCase()?.includes(q) || card?.color_name?.toLowerCase()?.includes(q)) return true;
            return false
        }





        setPairedCards(cardPairs);
    }


    function pairUpCards(allCards) {
        var alreadyIncludedCardIds = [];
        var pairedCards = [];
        for (let i = 0; i < allCards.length; i++) {
            let card = allCards[i];

            let cardPair = getLinkedCardsPaired(card);

            if (!alreadyIncludedCardIds.includes(cardPair?.[0]?.id)) {
                alreadyIncludedCardIds = [...alreadyIncludedCardIds, ...cardPair.map(c => c.id)]
                pairedCards.push(cardPair)
            }


        }

        return pairedCards;
    }


    return (
        <div className='w-full flex-col flex items-center p-2  pb-96 gap-4 relative pt-14'>
            <div className={'flex flex-col absolute inset-0 p-3 bottom-auto z-10 ' + searchContainerClassName} onBlur={() => setTimeout(() => setSearchFocused(false), 100)} onFocus={() => setSearchFocused(true)}>
                <div className={'flex flex-col border border-neutral bg-base-100 w-full rounded-lg rounded-b-xl transition-all ' + (searchFocused ? " h-[4.5rem] " : " h-8 ")}>
                    <input type="text" name="" id="" value={search} defaultValue={defaultSearch} onChange={(e) => handleSearchUpdate(e?.target?.value || "")} placeholder='Search' className='w-full input input-sm shadow focus:outline-none scale-[101%] -mt-[1px] ' />
                    {searchFocused && <div className='w-full flex items-center p-2 gap-2 overflow-x-scroll scrollbar-hide h-full overflow-y-hidden'>
                        {SEARCH_PILLS.map((data) => <SearchPill selected={search?.toLowerCase() === data?.searchValue?.toLowerCase()} onClick={handleSearchUpdate} {...data} />)}
                    </div>}
                </div>

            </div>
            <div className='w-full flex flex-wrap items-center justify-center gap-2 scrollbar-hide'>
                {pairedCards?.[0] ?
                    pairedCards.map(cardPair => (
                        <div className='flex flex-col gap-1' key={cardPair?.[0]?.id}>
                            <LinkedCardsContainer cards={cardPair} onClick={() => onClick(cardPair[0])} />
                            {showDifficulty && <DifficultyPill difficulty={avgFromCards(cardPair)} />}
                        </div>
                    ))
                    :
                    visibleCards?.map(card => (
                        <div key={card?.id} className='flex flex-col gap-1 items-center'>
                            <div  onClick={() => onClick(card)} className='card relative scale-[25%] md:scale-[50%] -mx-24 md:-mx-16 -my-36 md:-m-24 '><CardFront card={card} color={card?.color} /></div>
                            {showDifficulty &&
                                <>
                                    <div className='hidden md:block'>
                                        <DifficultyPill difficulty={card?.difficulty} />
                                    </div>
                                    <div className='block md:hidden'>
                                        <DifficultyPill minimal difficulty={card?.difficulty} />
                                    </div>
                                </>
                            }
                        </div>
                    ))
                }

            </div>
        </div>

    );
}




function SearchPill({ title, searchValue, style, onClick = () => { }, selected }) {


    return (
        <div onClick={() => onClick(searchValue)} className={" whitespace-nowrap rounded-lg border border-neutral text-neutral bg-base-100 text-xs px-3 py-1 h-6 flex items-center justify-center transition-all " + (selected ? " shadow-sm shadow-neutral/50 order-first " : " shadow-none ")} style={style}>
            {title}
        </div>
    )
}