


// icons
import { FaTools, FaBomb } from "react-icons/fa"
import { AiOutlineInfoCircle } from 'react-icons/ai';




import LinkedCardsContainer from "../../components/LinkedCardsContainer";
import { getLinkedCardsPairedById } from "../../helpers/cards";







export default function WorkbenchView(props) {
    return (
        <div className="flex flex-col justify-start items-center scrollbar-hide h-full w-full gap-4 overflow-y-scroll pb-24 ">
            <TitleBar fixed titleElement={
                <>
                    <FaTools />
                    <h1>Workbench</h1>
                </>
            } />

            <div className="absolute inset-0 bg-blue-100 flex flex-col lg:flex-row w-full">
                <div className="p-4 pt-14 w-full max-w-lg bg-green-100 ">  {/* Left Bar With linked cards box */}

                   
                    <div className="flex flex-col items-start justify-start w-full h-36">  {/* Component for Linked Cards */}
                        <div className="flex items-center justify-start h-full w-full">
                            <LinkedCardsContainer cards={getLinkedCardsPairedById("r000")} />
                            <div className="w-12 bg-purple-200 p-2 h-full flex flex-col items-center justify-center">
                                <ActionCircle icon={<AiOutlineInfoCircle />} />
                            </div>
                        </div>
                    </div>

                </div>




                <div className="p-4 pt-14 grow bg-red-100">  {/* Right Bar With More Settings */}

                </div>
            </div>

        </div>
    );
}



export function ActionCircle({ onClick, icon, tooltip }) {
    return (
        <div onClick={onClick} className={"h-8 w-8 rounded-full bg-neutral flex items-center justify-center text-neutral-content clickable " + (tooltip && " tooltip ")} data-tip={tooltip}>
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



