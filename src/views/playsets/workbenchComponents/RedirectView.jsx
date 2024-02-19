

import { useEffect, useState, useMemo, useCallback, useContext } from "react";


// icons
import { FaArrowLeft, FaPlus, FaTools } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";


// misc
import WorkbenchView, { TitleBar } from "../WorkbenchView";
import PlaysetDisplay from "../../../components/playsets/PlaysetDisplay";
import { getPlaysetById, maximizePlayset, minimizePlayset } from "../../../helpers/playsets";
import MegaButton, { EditPlaysetButton, RemixButton } from "../../../components/MegaButtons";
import { PageContext } from "../../../components/PageContextProvider";
import { useParams } from "react-router-dom";

export default function WorkbenchRedirectView({ editMode = false, remixMode = false }) {

    // const { playset = null } = props;

    const { playsetId } = useParams();

    if (!playsetId) {
        return <WorkbenchView />
    }

    const { user, smoothNavigate } = useContext(PageContext);

    console.log(editMode, remixMode)

    const [loading, setLoading] = useState(true);
    const [playset, setPlayset] = useState(null);

    const { isPlaysetOwner } = useMemo(() => {
        console.log(playset)
        let isPlaysetOwner = playset?.user_id && playset?.user_id === user?.id;


        return { isPlaysetOwner }
    }, [playset, user])

    useEffect(() => {
        setTimeout(async () => {
            console.log(await getPlaysetById(playsetId))
            setPlayset(maximizePlayset(await getPlaysetById(playsetId, null, { ignoreCache: true })))
            setLoading(false);
        }, 2000)
    }, [playsetId])


    if (playset && editMode && isPlaysetOwner) {
        return <WorkbenchView startingPlayset={playset} editMode={true} />
    }

    if (playset && remixMode) {
        return <WorkbenchView startingPlayset={playset} remixMode={true} />
    }

    if (!loading && !playset) {
        return <Workbench404 />
    }


    return (loading ?
        <RedirectLoadingView /> :
        !playset ? <Workbench404 /> :
            isPlaysetOwner ?
                <RedirectOptionsView playset={playset} text={"You made this playset:"}>
                    <RemixButton onClick={() => smoothNavigate(`/workbench/${playset.id}/remix`)} />
                    <EditPlaysetButton onClick={() => smoothNavigate(`/workbench/${playset.id}/edit`)} />
                </RedirectOptionsView>
                :
                <RedirectOptionsView playset={playset} text={"Someone else made this playset:"}>
                    <RemixButton onClick={() => smoothNavigate(`/workbench/${playset.id}/remix`)} />
                    <MegaButton title="Open playset" Icon={<FiExternalLink />} fill textColor={"#72c4ff"} onClick={() => smoothNavigate(`/playsets/${playset.id}`)}>
                        <div className="">Open</div>
                    </MegaButton>
                </RedirectOptionsView>
    );
}



function Workbench404() {
    const { smoothNavigate } = useContext(PageContext);
    return (
        <div className=" w-full h-full flex flex-col items-center justify-center  transition-all">
            <TitleBar />
            <div className="  animate__animated animate__fadeIn w-full h-full p-4 flex flex-col max-w-lg items-center justify-center  transition-all gap-1">
                <h1 className="-mt-28 text-7xl font-extrabold text-normal text-center">404</h1>
                <div className="flex w-full items-center justify-center gap-2 mb-2">
                    Could not find this playset.
                </div>

                <div className="flex w-full items-center justify-center gap-2">
                    <MegaButton title="Go back" Icon={<FaArrowLeft className="group-hover:-translate-x-1 transition-all" />} fill textColor={"#0019fd"} onClick={() => window.history.back()}>
                        Go back
                    </MegaButton>
                    <MegaButton title="Make playset" Icon={<FaPlus className="group-hover:-rotate-180 transition-all" />} fill textColor={"#fc021b"} onClick={() => smoothNavigate("/workbench")}>
                        Playset
                    </MegaButton>
                </div>
            </div>
        </div>
    )
}



export function RedirectOptionsView({ children, text, playset }) {

    return (
        <div className=" w-full h-full flex flex-col items-center justify-center  transition-all">
            <TitleBar />
            <div className="  animate__animated animate__fadeIn w-full h-full p-4 flex flex-col max-w-lg items-center justify-center  transition-all gap-1">
                <h1 className="-mt-28 text-2xl font-extrabold text-title text-center">{text}</h1>
                <PlaysetDisplay playset={playset} showPills quickActions={null} />
                <div className="flex w-full items-center justify-center gap-2">
                    {children}
                </div>
            </div>
        </div>
    )
}



export function RedirectLoadingView() {
    return (
        <div className="w-full h-full flex flex-col ">
            <TitleBar />
            <div className="w-full h-full flex flex-col p-4 items-center justify-center text-2xl font-extrabold text-title transition-all gap-1">
                <h1 className="-mt-16">PREPARING YOUR</h1>
                <div className="flex items-center justify-start gap-3 text-secondary ">
                    <h1>Workbench</h1>
                </div>
                <FaTools className="animate-spin text-4xl mt-4 text-secondary" />

            </div>
        </div>
    )
}