
import { useState, useContext } from "react"

// icons
import { FaTools, FaBomb } from "react-icons/fa"
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { MdOutlineClose } from "react-icons/md"




import LinkedCardsContainer from "../../components/LinkedCardsContainer";
import { getCardFromId, getLinkedCardsPairedById } from "../../helpers/cards";
import { PageContext } from "../../components/PageContextProvider";
import CardInfoMenu from "../../components/menus/CardInfoMenu";
import { WorkbenchPlaysetArea } from "../../components/playsets/PlaysetAreas";







export default function WorkbenchView(props) {

    const { setMenu } = useContext(PageContext);

    const [primaries, setPrimaries] = useState([
        ["b001", "r001"],
    ])


    // events
    function onCardSetInfo(card) {
        setMenu(<CardInfoMenu card={card} color={card?.color} />)
    }


    return (
        <div className="flex flex-col justify-start items-center scrollbar-hide h-full w-full gap-4 overflow-y-scroll pb-24 ">
            <TitleBar fixed titleElement={
                <>
                    <FaTools />
                    <h1>Workbench</h1>
                </>
            } />

            <div className="absolute inset-0 flex flex-col md:flex-row w-full">
                <div className="p-4 pt-14 w-full max-w-sm lg:max-w-md xl:max-w-xl">  {/* Left Bar With linked cards box */}


                    <WorkbenchPlaysetArea areaId="primaries">
                        {primaries.map((cards, i) => <WorkbenchLinkedCards onInfo={onCardSetInfo} key={"primary-" + i + cards?.[0]?.id} id={cards[0]} />)}
                    </WorkbenchPlaysetArea>



                </div>




                <div className="p-4 pt-14 grow bg-neutral/10">  {/* Right Bar With More Settings */}

                </div>
            </div>

        </div>
    );
}





export function WorkbenchLinkedCards({ id, onInfo = (card) => { } }) {

    const cards = getLinkedCardsPairedById(id)

    return (
        <div className="flex flex-col items-start justify-start w-full h-36">
            <div className="flex items-center justify-start h-full w-full">
                <LinkedCardsContainer cards={cards} />
                <div className="w-12 p-2 h-full flex flex-col items-center justify-center">
                    <ActionCircle icon={<MdOutlineClose />} />
                    <ActionCircle onClick={() => onInfo(cards[0])} icon={<AiOutlineInfoCircle />} />
                </div>
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



