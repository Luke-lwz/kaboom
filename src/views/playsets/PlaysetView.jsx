import { useParams } from "react-router-dom";
import { useContext, useMemo, useState, useEffect } from "react"
import { PageContext } from "../../components/PageContextProvider";
import { getPlaysetById, maximizePlaylist } from "../../helpers/playsets";
import { PlaysetSimulator, TitleBar } from "./WorkbenchView";
import PlaysetDisplay from "../../components/playsets/PlaysetDisplay";


//icons
import {BsCassetteFill} from "react-icons/bs"

function PlaysetView({ }) {

    const { id } = useParams();

    const { smoothNavigate } = useContext(PageContext)

    if (!id) smoothNavigate("/playsets")


    const [playset, setPlayset] = useState(null);


    const playsetMaximized = useMemo(() => {
        return maximizePlaylist(playset)
    }, [playset])


    useEffect(() => {
        getPlayset(id)
    }, [id])

    async function getPlayset(id) {
        const playset = await getPlaysetById(id);


        setPlayset(playset)
        console.log(playset)
        if (id && !playset) smoothNavigate("/playsets")
    }


    return (
        <div className="flex flex-col lg:flex-row w-full h-full overflow-x-hidden overflow-y-scroll scrollbar-hide ">


            <div className="w-full lg:max-w-3xl flex flex-col items-center justify-start border-neutral/10 lg:border-r">  {/* Left Bar With linked cards box */}

                <TitleBar titleElement={
                    <>
                        <BsCassetteFill className="text-2xl md:text-3xl"/>
                        <h1>Playsets</h1>
                    </>
                } />


                <div className="w-full max-w-2xl p-4 flex flex-col items-center">
                    {playsetMaximized && <PlaysetDisplay forceOpen playset={playsetMaximized} />}
                    {playset?.description && <div className="text-sm text-base-content p-4 w-full">
                    {playset?.description}
                </div>}
                </div>

                

            </div>



            <div className="grow lg:overflow-x-hidden lg:overflow-y-scroll scrollbar-hide gap-4 flex flex-col items-center pt-0">
                <div className="w-full max-w-2xl p-4">
                    {playsetMaximized && <PlaysetSimulator playset={playsetMaximized} />}
                </div>
            </div>

        </div>
    );
}

export default PlaysetView;