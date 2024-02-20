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

    const { smoothNavigate, user, setPrompt, checkAuth } = useContext(PageContext)

    if (!id) smoothNavigate("/playsets")


    const [playset, setPlayset] = useState(null);

    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        if (playset) {
            const interaction = playset?.interaction?.[0] || {};
            setBookmarked(interaction?.bookmark || false);
        }
    }, [playset])


    const playsetMaximized = useMemo(() => {
        return maximizePlayset(playset)
    }, [playset])


    useEffect(() => {
        getPlayset(id, user?.id)
    }, [id, user])

    async function getPlayset(id, user_id) {
        const playset = await getPlaysetById(id, user_id, { ignoreCache: true });

    

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
                    {playsetMaximized && <PlaysetDisplay key={user?.id + "'s playset"} autoFetchInteractions quickActions={{ vote: true, profile: true }} forceOpen playset={playsetMaximized} />}
                    <div className="w-full grid grid-cols-2 gap-2 mt-2">
                        <RemixButton onClick={() => checkAuth(() => smoothNavigate(`/workbench/${playset?.id}/remix`))} />
                        <BookmarkMegaButton bookmarked={bookmarked} onChange={(...arr) => checkAuth(() => handleBookmark(...arr))} />
                        {playset?.user_id === user?.id && <>
                            <EditPlaysetButton onClick={() => checkAuth(() => smoothNavigate(`/workbench/${playset?.id}/edit`))} />
                            <DeletePlaysetButton onClick={() => checkAuth(() => deletePlayset())} />
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