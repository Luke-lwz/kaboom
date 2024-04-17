import { useParams } from "react-router-dom";
import { useContext, useMemo, useState, useEffect, useCallback } from "react"
import { PageContext } from "../../components/PageContextProvider";
import { getPlaysetById, maximizePlayset } from "../../helpers/playsets";
import { PlaysetSimulator, TitleBar } from "./WorkbenchView";
import PlaysetDisplay from "../../components/playsets/PlaysetDisplay";


//icons
import { BsCassetteFill, BsFillCheckSquareFill } from "react-icons/bs"
import MegaButton, { BigAbsoluteMakeButton, BookmarkMegaButton, DeletePlaysetButton, EditPlaysetButton, RemixButton } from "../../components/MegaButtons";
import supabase from "../../supabase";
import toast from "react-hot-toast";
import { promiser } from "../../helpers/promiser";
import DescriptionBox from "../../components/DescriptionBox";
import { VscVerified, VscVerifiedFilled } from "react-icons/vsc";
import { FaGhost, FaPlay } from "react-icons/fa";
import Peer from "peerjs";
import { constructPeerID, getPeerConfig } from "../../helpers/peerid";
import { NamePrompt } from "../HomeView";
import { idGenAlphabet } from "../../helpers/idgen";

function PlaysetView({ }) {

    const { id } = useParams();

    const { redirect, smoothNavigate, user, setPrompt, checkAuth, allLocalStorage } = useContext(PageContext)

    if (!id) smoothNavigate("/playsets")


    const [playset, setPlayset] = useState(null);

    const [bookmarked, setBookmarked] = useState(false);

    const [verified, setVerified] = useState(false);
    const [official, setOfficial] = useState(false);
    const [ghost, setGhost] = useState(false);

    const [createPeer, setCreatePeer] = useState();




    async function initPeers() {
        const createPeer = new Peer(await getPeerConfig());
        setCreatePeer(createPeer);
    }

    useEffect(() => {
        initPeers();
    }, [])

    useEffect(() => {
        if (playset) {
            const interaction = playset?.interaction?.[0] || {};
            setBookmarked(interaction?.bookmark || false);
        }
    }, [playset])


    const playsetMaximized = useMemo(() => {
        console.log(playset)
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
        setBookmarked(b => { initalValue = b; return mark });

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


    const createRoom = useCallback(async (playset_id) => {



        setPrompt({ element: <NamePrompt onEnter={setNameAndCreate} buttonValue="CREATE GAME" /> })


        async function setNameAndCreate(name) {
            if (name === "") return setPrompt(null);



            const code = idGenAlphabet();



            const connToRoom = createPeer.connect(constructPeerID(code, "board"));
            connToRoom.on("open", () => {
                toast.error("Error");
                setPrompt(null);
                connToRoom.close();
            })


            createPeer.on("error", (err) => {

                // removes all host-{code} from localStorage
                const all = allLocalStorage();
                for (let i = 0; i < all.length; i++) {
                    const element = all[i];
                    if (element.key.startsWith("game-")) {
                        localStorage.removeItem(element.key)
                        // remove host player info
                        const code = element.key.split("-")[1];
                        localStorage.removeItem(`player-${code?.toUpperCase()}`)

                    }


                }


                localStorage.setItem(`game-${code}`, "{}");
                localStorage.setItem(`player-${code}`, JSON.stringify({
                    name,
                    id: "HOST"
                }));
                if (playset_id) localStorage.setItem("lastSelectedPlayset", playset_id);
                setPrompt(null);
                redirect(`/lobby/${code}`, { replace: true });
            })

        }


    }, [createPeer])


    const handleVerify = useCallback(async (mark) => {
        if (!user) return toast.error("You need to be an admin to verify");

        // optimistic
        var initalValue = mark;
        setVerified(b => { initalValue = b; return mark });
        setOfficial(false)


        // const { data, error } = await supabase
        //     .from("interactions")
        //     .upsert({
        //         playset_id: id,
        //         user_id: user?.id,
        //         bookmark: mark,
        //     })
        //     .select();
        // if (error || !data?.[0]) {
        //     toast.error("Something went wrong");
        //     setBookmarked(initalValue);
        //     return;
        // } else {
        //     setBookmarked(mark);
        // }
    }, [id, user])


    const handleOfficialize = useCallback(async (mark) => {
        if (!user) return toast.error("You need to be an admin to make this official");

        // optimistic
        var initalValue = mark;
        setOfficial(b => { initalValue = b; return mark });
        setVerified(false)

        // const { data, error } = await supabase
        //     .from("interactions")
        //     .upsert({
        //         playset_id: id,
        //         user_id: user?.id,
        //         bookmark: mark,
        //     })
        //     .select();
        // if (error || !data?.[0]) {
        //     toast.error("Something went wrong");
        //     setBookmarked(initalValue);
        //     return;
        // } else {
        //     setBookmarked(mark);
        // }
    }, [id, user])

    const handleGhost = useCallback(async (mark) => {
        if (!user) return toast.error("You need to be an admin to ghost");

        // optimistic
        var initalValue = mark;
        setGhost(b => { initalValue = b; return mark });

        // const { data, error } = await supabase
        //     .from("interactions")
        //     .upsert({
        //         playset_id: id,
        //         user_id: user?.id,
        //         bookmark: mark,
        //     })
        //     .select();
        // if (error || !data?.[0]) {
        //     toast.error("Something went wrong");
        //     setBookmarked(initalValue);
        //     return;
        // } else {
        //     setBookmarked(mark);
        // }
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
                    <DescriptionBox description={playset?.description} />
                    <div className="w-full grid grid-cols-2 gap-2 mt-2">
                        <RemixButton onClick={() => checkAuth(() => smoothNavigate(`/workbench/${playset?.id}/remix`))} />
                        <BookmarkMegaButton bookmarked={bookmarked} onChange={(...arr) => checkAuth(() => handleBookmark(...arr))} />
                        {playset?.user_id === user?.id && <>
                            <EditPlaysetButton onClick={() => checkAuth(() => smoothNavigate(`/workbench/${playset?.id}/edit`))} />
                            <DeletePlaysetButton onClick={() => checkAuth(() => deletePlayset())} />
                        </>}
                    </div>
                    <MegaButton Icon={<FaPlay className="text-sm" />} color={"#0019fd"} fill className={"mt-2"} onClick={() => createRoom(id)}>
                        Play
                    </MegaButton>
                </div>


{/* 
This needs role "playset_mod"
*/}
                {false && <>
                    <h1 className="font-extrabold tracking-tighter ">Mod options</h1>
                    <div className="w-full flex justify-between items-center p-4 gap-2">
                        <MegaButton color={"#1c96e8" + (verified ? "" : "60")} fill className={"text-2xl"} onClick={() => handleVerify(!verified)} showDot={verified} >
                            <VscVerifiedFilled />
                        </MegaButton>
                        <MegaButton color={"#000000" + (official ? "" : "60")} fill className={"text-xl"} onClick={() => handleOfficialize(!official)} showDot={official} >
                            <BsFillCheckSquareFill />
                        </MegaButton>

                        <MegaButton color={"#0bcae3" + (ghost ? "" : "60")} fill className={"text-xl"} onClick={() => handleGhost(!ghost)} showDot={ghost} >
                            <FaGhost />
                        </MegaButton>
                    </div>
                </>}


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