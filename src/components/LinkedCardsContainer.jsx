import { CardFront } from "./Card";



export default function LinkedCardsContainer({id, cards, onClick}) {
    return (
        <div onClick={() => onClick(id || cards?.[0]?.id)} className="clickable border-neutral border-2 text-base-content rounded-lg overflow-x-scroll overflow-y-hidden gap-4 flex items-center justify-start px-5 py-3 h-36 pt-5 scrollbar-hide ">
            {cards?.map(card => <div key={card?.id}  className='card relative scale-[30%] -mx-[5.5rem] '><CardFront card={card} color={card?.color} /></div>)}
        </div>
    )
}