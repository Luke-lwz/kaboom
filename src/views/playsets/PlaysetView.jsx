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
import { FaGhost, FaPen, FaPlay, FaTrash } from "react-icons/fa";
import Peer from "peerjs";
import { constructPeerID, getPeerConfig } from "../../helpers/peerid";
import { DevModeBanner, NamePrompt } from "../HomeView";
import { idGenAlphabet } from "../../helpers/idgen";
import { useQuery } from "@tanstack/react-query";
import { MdConstruction } from "react-icons/md";
import InfoBanner from "../../components/InfoBanner";
import HiddenPlaysetReasonMenu from "../../components/menus/HiddenPlaysetReasonMenu";

function PlaysetView({ }) {

    const { id } = useParams();

    const { redirect, smoothNavigate, user, setPrompt, checkAuth, allLocalStorage, hasPermission, setMenu, devMode } = useContext(PageContext)

    if (!id) smoothNavigate("/playsets")


    const { data: playset, isLoading, refetch } = useQuery({ queryKey: ["playset", id, user?.id], queryFn: fetchPlayset })
    const [bookmarked, setBookmarked] = useState(false);

    const [verified, setVerified] = useState(false);
    const [official, setOfficial] = useState(false);
    const [ghost, setGhost] = useState(false);
    const [dev, setDev] = useState(false);
    const [hiddenReason, setHiddenReason] = useState(false);
    const [editHiddenReason, setEditHiddenReason] = useState("");

    const [createPeer, setCreatePeer] = useState();


    function fetchPlayset({ queryKey }) {
        const [, id, user_id] = queryKey;
        const playset = getPlaysetById(id, user_id, { ignoreCache: true });

        if (id && !playset) smoothNavigate("/playsets")

        return playset;
    }





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

            if (playset?.playsets_metadata) {
                const { verified, official, hidden, hidden_reason, dev } = playset?.playsets_metadata;
                setVerified(verified);
                setOfficial(official);
                setGhost(hidden);
                setDev(dev);
                setHiddenReason(hidden_reason);
            }
        }
    }, [playset])


    const playsetMaximized = useMemo(() => {
        return maximizePlayset(playset)
    }, [playset])




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
        setDev(false);


        const { data, error } = await supabase
            .from("playsets_metadata")
            .upsert({
                id,
                verified: mark,
                official: false,
                dev: false,
            })
            .select();
        if (error || !data?.[0]) {
            console.log(error)
            toast.error("Something went wrong");
            setVerified(initalValue);
            return;
        } else {
            setVerified(mark);
            refetch();
        }
    }, [id, user])


    const handleOfficialize = useCallback(async (mark) => {
        if (!user) return toast.error("You need to be an admin to make this official");

        // optimistic
        var initalValue = mark;
        setOfficial(b => { initalValue = b; return mark });
        setVerified(false)
        setDev(false);


        const { data, error } = await supabase
            .from("playsets_metadata")
            .upsert({
                id,
                official: mark,
                verified: false,
                dev: false
            })
            .select();
        if (error || !data?.[0]) {
            console.log(error)
            toast.error("Something went wrong");
            setOfficial(initalValue);
            return;
        } else {
            setOfficial(mark);
            refetch();
        }
    }, [id, user])

    const handleDev = useCallback(async (mark) => {
        if (!user) return toast.error("You need to be an admin to make this a dev playset");

        // optimistic
        var initalValue = mark;
        setDev(b => { initalValue = b; return mark });
        setOfficial(false);
        setVerified(false)

        const { data, error } = await supabase
            .from("playsets_metadata")
            .upsert({
                id,
                dev: mark,
                verified: false,
                official: false
            })
            .select();
        if (error || !data?.[0]) {
            console.log(error)
            toast.error("Something went wrong");
            setDev(initalValue);
            return;
        } else {
            setDev(mark);
            refetch();
        }
    }, [id, user])

    const handleGhost = useCallback(async (mark) => {
        if (!user) return toast.error("You need to be an admin to ghost");

        // optimistic
        var initalValue = mark;
        setGhost(b => { initalValue = b; return mark });

        const { data, error } = await supabase
            .from("playsets_metadata")
            .upsert({
                id,
                hidden: mark,
            })
            .select();
        if (error || !data?.[0]) {
            console.log(error)
            toast.error("Something went wrong");
            setGhost(initalValue);
            return;
        } else {
            setGhost(mark);
            refetch();
        }
    }, [id, user])

    const handleReason = useCallback(async (reason) => {
        if (!user) return toast.error("You need to be an admin to ghost");

        // optimistic
        var initalValue = reason;
        setHiddenReason(b => { initalValue = b; return reason });

        const { data, error } = await supabase
            .from("playsets_metadata")
            .upsert({
                id,
                hidden_reason: reason,
            })
            .select();
        if (error || !data?.[0]) {
            console.log(error)
            toast.error("Something went wrong");
            setHiddenReason(initalValue);
            return;
        } else {
            setHiddenReason(reason);
            refetch();
        }
        setEditHiddenReason(false)
    }, [id, user])


    if (isLoading) return <div className="w-full flex flex-col items-center">
        <TitleBar titleElement={
            <>
                <BsCassetteFill className="text-2xl md:text-3xl" />
                <h1 onClick={() => smoothNavigate("/playsets")}>Playsets</h1>
            </>
        } />

        <div className="loading loading-spinner" />
    </div>

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
                    <div className="flex flex-col gap-4 w-full max-w-2xl -translate-y-4">
                        {!ghost && <>
                            {dev && <DevModeBanner text="Development playset" noButton size={"sm"} />}
                            {official && <OfficialPlaysetBanner />}
                        </>}
                        {ghost && <GhostPlaysetBanner onClick={() => {
                            setMenu(<HiddenPlaysetReasonMenu reason={hiddenReason}/>)
                        }} />}

                    </div>

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


                {hasPermission("playset_mod") && <>
                    <h1 className="font-extrabold tracking-tighter ">Mod options</h1>
                    <div className="w-full flex justify-between items-center p-4 gap-2 max-w-2xl">
                        <MegaButton color={"#1c96e8" + (verified ? "" : "60")} fill className={"text-2xl"} onClick={() => handleVerify(!verified)} showDot={verified} >
                            <VscVerifiedFilled />
                        </MegaButton>
                        <MegaButton color={"#000000" + (official ? "" : "60")} fill className={"text-xl"} onClick={() => handleOfficialize(!official)} showDot={official} >
                            <BsFillCheckSquareFill />
                        </MegaButton>


                        <MegaButton fill className={"text-xl " + (dev ? " dev-mode-stripes " : " !bg-amber-400/60 ")} onClick={() => handleDev(!dev)} showDot={dev} >
                            <MdConstruction />
                        </MegaButton>

                        <MegaButton color={"#0bcae3" + (ghost ? "" : "60")} fill className={"text-xl"} onClick={() => handleGhost(!ghost)} showDot={ghost} >
                            <FaGhost />
                        </MegaButton>
                    </div>
                    {ghost && <div className="w-full max-w-2xl -mt-2 px-4 flex flex-col">
                        {!editHiddenReason && <>
                            {hiddenReason?.length > 2 ?
                                <>
                                    <DescriptionBox description={hiddenReason} prefixText="Reason" />
                                    <p className="font-bold text-info hover:underline text-sm flex items-center gap-1" onClick={() => setEditHiddenReason(true)}>Edit <FaPen size={10} /></p>
                                </>
                                :
                                <div className="cursor-pointer group" onClick={() => setEditHiddenReason(true)}>
                                    Why did you hide this playset? <span className="font-bold text-info group-hover:underline">Add a reason!</span>
                                </div>
                            }
                        </>}

                        {editHiddenReason && <form onSubmit={(e) => {
                            e.preventDefault();
                            const textArea = document.getElementById("hidden-reason-admin-text");
                            const text = textArea?.value;
                            console.log("text", text)
                            handleReason(text);
                        }} className="w-full flex flex-col">
                            <textarea autoFocus id="hidden-reason-admin-text" defaultValue={hiddenReason || ""}  className="border-2 border-neutral rounded-xl p-2 text-sm" />
                            <div className="w-full flex items-center gap-2 justify-between text-normal mt-2">
                                <button className="btn btn-ghost noskew btn-sm" onClick={() => handleReason(null)}><FaTrash className="skew text-error" /></button>

                                <div className="flex">

                                    <button onClick={() => setEditHiddenReason(false)} className="btn btn-ghost noskew btn-sm">Cancel</button>
                                    <button type="submit" className="btn btn-secondary noskew btn-sm">save</button>
                                </div>
                            </div>
                        </form>}
                    </div>}
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



function OfficialPlaysetBanner() {
    return (
        <InfoBanner className={"bg-black pl-3"} size="sm">
            <BsFillCheckSquareFill size={20} className="mr-3" /> Official Kaboom playset
        </InfoBanner>
    )
}


function GhostPlaysetBanner({onClick}) {
    return (
        <InfoBanner onClick={onClick} size="sm" style={{ backgroundColor: "#0bcae3" }} className={"pl-3 pr-2 text-normal"} endElement={
            <button style={{ color: "#0bcae3" }} className="btn btn-xs  bg-white hover:bg-white border-none noskew">reason</button>
        }>
            <FaGhost color="#ffffff" size={20} />
            <div className="flex flex-col justify-center tracking-tighter ml-3">
                <h3 className="font-extrabold text-base text-normal">Your playset was hidden</h3>
                <p className="text-xs text-normal -mt-1">It may have violated the <a href="/terms" className="underline">Terms of Service</a></p>
            </div>
        </InfoBanner>
    )
}

export default PlaysetView;