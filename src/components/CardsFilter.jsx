import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllCards, getCardColorFromColorName, getCardFromId, CARD_COLOR_ORDER, pairUpCards, CARD_COLOR_FILTER_OPTIONS, sortCards } from '../helpers/cards';
import { CardFront } from './Card';
import LinkedCardsContainer from './LinkedCardsContainer';
import { DifficultyPill } from './Pills';
import { avgFromCards } from '../helpers/difficulty';
import useWindowDimensions from '../hooks/useWindowDimensions';
import { VariableSizeList as List } from 'react-window';

const SEARCH_PILLS = [
    {
        title: "Version 1",
        searchValue: "v1"
    },
    {
        title: "Version 2",
        searchValue: "v2"
    },
    {
        title: "Official",
        searchValue: "official"
    },
    ...CARD_COLOR_FILTER_OPTIONS.map(color => {
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
        title: "Primary cards",
        searchValue: "primary",
        style: {
            borderColor: "#152aed",
            color: "#ec1f2b"
        }
    },
    {
        title: "Special cards",
        searchValue: "special",
        style: {
            borderColor: "#AA6DFF",
            color: "#AA6DFF"
        }
    },
    {
        title: "Necroboomicon",
        searchValue: "necroboomicon",
        style: {
            borderColor: "#9cde47",
            color: "#9cde47"
        }
    },
    {
        title: "Instant win",
        searchValue: "instant-win"
    },

]

export default function CardsFilter({ defaultSearch = "", onSearchUpdate = () => { }, onClick = () => { }, searchContainerClassName = "", paired = false, virtualized = false, showDifficulty = false, filter = { visibleCards: undefined, hiddenCards: undefined } }) {

    const { height, width } = useWindowDimensions();

    const sortAllCards = useCallback(() => {
        let all = getAllCards();

        if (filter?.visibleCards) all = all.filter(card => filter?.visibleCards?.includes(card?.id)); // only shows cards that are specified in prop "filter.visibleCards"
        if (filter?.hiddenCards) all = all.filter(card => !filter?.hiddenCards?.includes(card?.id));

        return sortCards(all, true);
    }, [])

    const allCards = useMemo(() => sortAllCards(), []);

    const [visibleCards, setVisibleCards] = useState(allCards || []);
    const [searchFocused, setSearchFocused] = useState(false);
    const [search, setSearch] = useState(defaultSearch);

    const [pairedCards, setPairedCards] = useState(paired ? pairUpCards(allCards) || [] : []);



    const filterVisibleCards = useCallback((query) => {
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
        cards.sort((x, y) => { return x.name.toLowerCase().startsWith(q) ? -1 : y.name.toLowerCase().startsWith(q) ? 1 : 0; });



        setVisibleCards(cards);
    }, [allCards])

    const filterVisiblePairedCards = useCallback((query) => {
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
    }, [allCards])




    const handleSearchUpdate = useCallback((value) => {
        filterVisibleCards(value)
        if (paired) filterVisiblePairedCards(value);

        setSearch(value);
        onSearchUpdate(value)
    }, [paired])

    useEffect(() => {
        if (defaultSearch) filterVisibleCards(defaultSearch)
        if (defaultSearch && paired) filterVisiblePairedCards(defaultSearch);

    }, [])






    const rows = useMemo(() => {
        const w = width - 32;
        const cards = paired && pairedCards[0] ? pairedCards : visibleCards;
        const gap = 8;
        const cardWidth = width < 768 ? 64 : 128;
        const cardsPerRow = Math.floor(w / (cardWidth + gap));
        const rows = [];
        let row = [];
        let i = 0;
        for (const card of cards) {
            row.push(card);
            i++;
            if (i >= cardsPerRow) {
                rows.push(row);
                row = [];
                i = 0;
            }
        }
        if (row.length > 0) rows.push(row);
        return rows;
    }, [pairedCards, visibleCards, width, paired])



    // functions




    const Row = useCallback(({ index, style }) => {

        const row = rows[index];
        return (
            <div className='flex flex-row gap-2 justify-center' style={style}>
                {row?.map(card => (paired ?
                    <div className='flex flex-col gap-1' key={card?.[0]?.id}>
                        <LinkedCardsContainer cards={card} onClick={() => onClick(card[0])} />
                        {showDifficulty && <DifficultyPill difficulty={avgFromCards(card)} />}
                    </div>
                    :
                    <div key={card?.id} className='flex flex-col gap-1 items-center'>
                        <div onClick={() => onClick(card)} className='card relative scale-[25%] md:scale-[50%] -mx-24 md:-mx-16 -my-36 md:-m-24 '><CardFront card={card} color={card?.color} /></div>
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
                ))}
            </div>
        )
    }, [rows, onClick, showDifficulty, paired]);




    return (
        <div className='w-full flex-col flex items-center p-2  pb-96 gap-4 relative pt-14'>
            <div className={'flex flex-col absolute inset-0 p-3 bottom-auto z-10 ' + searchContainerClassName} onBlur={() => setTimeout(() => setSearchFocused(false), 250)} onFocus={() => setSearchFocused(true)}>
                <div className={'flex flex-col border border-neutral bg-base-100 w-full rounded-lg rounded-b-xl transition-all ' + (searchFocused ? " h-[4.5rem] " : " h-8 ")}>
                    <input type="text" name="" id="" value={search} defaultValue={defaultSearch} onChange={(e) => handleSearchUpdate(e?.target?.value || "")} placeholder='Search' className='w-full input input-sm shadow focus:outline-none scale-[101%] -mt-[1px] ' />
                    {searchFocused && <div className='w-full flex items-center p-2 gap-2 overflow-x-scroll scrollbar-hide h-full overflow-y-hidden'>
                        {SEARCH_PILLS.map((data) => <SearchPill selected={search?.toLowerCase() === data?.searchValue?.toLowerCase()} onClick={handleSearchUpdate} {...data} />)}
                    </div>}
                </div>

            </div>



            <div className='w-full flex flex-wrap items-center justify-center gap-2 scrollbar-hide'>
                {virtualized ? <List
                    className='scrollbar-hide overflow-x-hidden'
                    height={height}
                    itemCount={rows.length}
                    itemSize={width < 768 ? () => 96 + 8 : () => 192 + 8}
                    width={width}
                >
                    {Row}
                </List>
                    :
                    (pairedCards?.[0] ?
                        pairedCards.map(cardPair => (
                            <div className='flex flex-col gap-1' key={cardPair?.[0]?.id}>
                                <LinkedCardsContainer cards={cardPair} onClick={() => onClick(cardPair[0])} />
                                {showDifficulty && <DifficultyPill difficulty={avgFromCards(cardPair)} />}
                            </div>
                        ))
                        :
                        visibleCards?.map(card => (
                            <div key={card?.id} className='flex flex-col gap-1 items-center'>
                                <div onClick={() => onClick(card)} className='card relative scale-[25%] md:scale-[50%] -mx-24 md:-mx-16 -my-36 md:-m-24 '><CardFront card={card} color={card?.color} /></div>
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
                    )}

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