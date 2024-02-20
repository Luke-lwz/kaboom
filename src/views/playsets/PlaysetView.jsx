import { useParams } from "react-router-dom";
import { useContext, useMemo, useState, useEffect, useCallback } from "react"
import { PageContext } from "../../components/PageContextProvider";
import { getPlaysetById, maximizePlayset } from "../../helpers/playsets";
import { PlaysetSimulator, TitleBar } from "./WorkbenchView";
import PlaysetDisplay from "../../components/playsets/PlaysetDisplay";


//icons
import { BsCassetteFill } from "react-icons/bs"
import { BigAbsoluteMakeButton, BookmarkMegaButton, DeletePlaysetButton, EditPlaysetButton, RemixButton } from "../../components/MegaButtons";
import supabase from "../../supabase";
import toast from "react-hot-toast";
import { promiser } from "../../helpers/promiser";

function PlaysetView({ }) {

    const { id } = useParams();

    const { smoothNavigate, user, setPrompt, checkAuthenticated } = useContext(PageContext)

    if (!id) smoothNavigate("/playsets")


    const [playset, setPlayset] = useState(null);


    const playsetMaximized = useMemo(() => {
        return maximizePlayset(playset)
    }, [playset])


    useEffect(() => {
        getPlayset(id)
    }, [id])

    async function getPlayset(id) {
        const playset = await getPlaysetById(id, user?.id, { ignoreCache: true });


        setPlayset(playset)
        console.log(playset)
        if (id && !playset) smoothNavigate("/playsets")
    }


    const deletePlayset = useCallback(() => {
        setPrompt({
            title: "Delete Playset?",
            text: "This cannot be undone.",
            onApprove: async () => {

                const { promise, promiseResolve, promiseReject } = promiser();

                toast.promise(promise, {
                    loading: 'Deleting Playset',
                    success: 'Playset deleted',
                    error: 'Error while deleting playset',
                })

                const { error } = await supabase
                    .from("playsets")
                    .delete()
                    .eq("id", id)
                if (error) {
                    promiseReject(error);
                } else {
                    promiseResolve();
                    smoothNavigate("/playsets");
                }
            }
        })
    }, [id])


    return (
        <div className="flex flex-col lg:flex-row w-full h-full overflow-x-hidden overflow-y-scroll scrollbar-hide pb-64">

            <BigAbsoluteMakeButton onClick={() => smoothNavigate("/workbench")} />

            <div className="w-full lg:max-w-3xl flex flex-col items-center justify-start border-neutral/10 lg:border-r">  {/* Left Bar With linked cards box */}

                <TitleBar titleElement={
                    <>
                        <BsCassetteFill className="text-2xl md:text-3xl" />
                        <h1 onClick={() => smoothNavigate("/playsets")}>Playsets</h1>
                    </>
                } />


                <div className="w-full max-w-2xl p-4 flex flex-col items-center">
                    {playsetMaximized && <PlaysetDisplay quickActions={{ vote: true, profile: true }} forceOpen playset={playsetMaximized} />}
                    <div className="w-full grid grid-cols-2 gap-2 mt-2">
                        <RemixButton onClick={() => checkAuthenticated(() => smoothNavigate(`/workbench/${playset?.id}/remix`))} />
                        <BookmarkMegaButton />
                        {playset?.user_id === user?.id && <>
                            <EditPlaysetButton onClick={() => checkAuthenticated(() => smoothNavigate(`/workbench/${playset?.id}/edit`))} />
                            <DeletePlaysetButton onClick={() => checkAuthenticated(() => deletePlayset())} />
                        </>}
                    </div>
                    {playset?.description && <div className=" text-base-content py-4 w-full mt-2">
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