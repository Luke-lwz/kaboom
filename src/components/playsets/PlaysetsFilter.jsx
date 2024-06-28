import { useParams } from "react-router-dom";
import { useContext, useMemo, useState, useEffect, useRef } from "react"
import supabase from "../../supabase";
import { PageContext } from "../../components/PageContextProvider";
import { maximizePlayset } from "../../helpers/playsets.js"

import PlaysetDisplay from "../../components/playsets/PlaysetDisplay"
import Pill from "../Pills.jsx";


import { MdOutlineWbIridescent, MdHistory } from "react-icons/md";
import { VscVerifiedFilled } from "react-icons/vsc";
import { BsCassetteFill, BsFillCheckSquareFill, BsX } from "react-icons/bs";
import { GiFireBomb } from "react-icons/gi";
import { FaSearch } from "react-icons/fa";
import { IoArrowUp, IoBookmark, IoHome, IoPersonAddSharp, IoPersonCircleOutline } from "react-icons/io5";
import { BiArrowBack } from "react-icons/bi";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import NewPage from "./filters/NewPage.jsx";
import PlaysetQueryList from "./filters/_components/PlaysetQueryList.jsx";
import useDebounce from "../../hooks/useDebounce.jsx";
import moment from "moment";

import { v4 as uuidv4 } from "uuid";
import useLocalStorage from "use-local-storage";


const TABS = [
    {
        name: "New",
        value: "new",
        color: "#02f771",
        icon: <MdOutlineWbIridescent className="text-base" />,
        filterFn: (query) => query.order("created_at", { ascending: false })
    },
    // {
    //     name: "Hot",
    //     value: "hot",
    //     color: "#f72b02",
    //     icon: <GiFireBomb className="text-base" />,
    //     filterFn: (query) => {
    //         const startOfMonth = moment().subtract(1, "month").startOf('day').toISOString(true);
    //         return query
    //         .order("count", { ascending: false, referencedTable: "upvote_count" })
    //     }
    // },
    {
        name: "Top",
        value: "top",
        color: "#0019fd",
        icon: <IoArrowUp className="text-base" />,
        filterFn: (query) => query.order("upvote_count", { ascending: false })
    },
    // {
    //     name: "Random",
    //     value: "random",
    //     color: "#cf03fc",
    //     icon: <BsFillCheckSquareFill className="text-base" />,
    //     filterFn: (query) => {
    //         const uuid = uuidv4();
    //         return query.gte("id", uuid).limit(1)
    //     },
    //     infinite: false,
    //     refetchEveryTime: true
    // },
    {
        name: "My Stuff",
        value: "my-stuff",
        color: "#eb34c0",
        icon: <IoHome className="text-sm mr-0.5" />,
        subTags: [
            {
                name: "Bookmarks",
                value: "my-bookmarks",
                color: "#eb34c0",
                icon: <IoBookmark className="text-sm mr-0.5" />,
                filterFn: (query) => query.eq("user_bookmarked", true).order("user_interaction_updated_at", { ascending: false }),
                needsLogin: true
            },
            {
                name: "Recent",
                value: "my-recent",
                color: "#eb34c0",
                icon: <MdHistory className="text-base mr-0.5" />,
                extraSelect: ",games_played(id,created_at)",
                filterFn: (query) => query.not("games_played", "is", null).order("created_at", { ascending: false, referencedTable: "games_played" }),
                needsLogin: true
            },
            {
                name: "My Playsets",
                value: "my-playsets",
                color: "#eb34c0",
                icon: <BsCassetteFill className="text-sm mr-0.5" />,
                filterFn: (query, queryKey) => {
                    const [name, userId] = queryKey;
                    return query.eq("user_id", userId).order("updated_at", { ascending: false })
                },
                needsLogin: true

            },
            // {
            //     name: "Following",
            //     value: "my-following",
            //     color: "#eb34c0",
            //     icon: <IoPersonAddSharp className="text-sm mr-0.5" />,
            // }
        ]
    },
    // {
    //     name: "Profiles",
    //     value: "profiles",
    //     color: "#ff0000",
    //     icon: <IoPersonCircleOutline className="text-base mr-0.5" />,
    //     subTags: [
    //         {
    //             name: "Hot",
    //             value: "profiles-hot",
    //             color: "#ff0000",
    //             icon: <GiFireBomb className="text-base" />,
    //         },
    //         {
    //             name: "New",
    //             value: "profiles-new",
    //             color: "#ff0000",
    //             icon: <MdOutlineWbIridescent className="text-base" />,
    //         },
    //         {
    //             name: "Following",
    //             value: "profiles-following",
    //             color: "#ff0000",
    //             icon: <IoPersonAddSharp className="text-sm mr-0.5" />,
    //         }
    //     ]
    // },

]


export default function PlaysetsFilter({ onPlaysetClick = (playset) => { } }) {
    const { id } = useParams();

    const { smoothNavigate, user } = useContext(PageContext)

    const [playsets, setplaysets] = useState([]);



    const lastActiveTabValue = localStorage.getItem("playsets-lastActiveTab")
    const lastActiveSubTabValue = localStorage.getItem("playsets-lastActiveSubTab")

    const lastActiveTab = TABS.find(tab => tab.value === lastActiveTabValue)
    const lastActiveSubTab = lastActiveTab?.subTags?.find(tab => tab.value === lastActiveSubTabValue)

    

    const [activeTab, setActiveTab] = useState(lastActiveTab || TABS[0])
    const [activeSubTab, setActiveSubTab] = useState(lastActiveSubTab || null)

    const [search, setSearch] = useState(null);


    const debouncedSearch = useDebounce(search, 1000);


    const searchInputRef = useRef(null);


    useEffect(() => {
        localStorage.setItem("playsets-lastActiveTab", activeTab?.value)
        localStorage.setItem("playsets-lastActiveSubTab", activeSubTab?.value)
    }, [activeTab, activeSubTab])



    useEffect(() => {
        if (search !== null) searchInputRef.current.focus()
    }, [search])



    return (
        <div className="w-full max-w-3xl flex flex-col gap-4 p-4 items-center pb-64">
            <div className={"flex justify-between items-center w-full relative transition-all h-8 "}>


                <SubTabsComponent activeTab={activeTab} setActiveTab={setActiveTab} activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} search={search} hidden={!activeTab?.subTags} />
                <NavTabsComponent activeTab={activeTab} setActiveTab={setActiveTab} activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} search={search} hidden={activeTab?.subTags} />
                {!activeTab?.subTags && <button onClick={() => setSearch("")} style={{ boxShadow: "-13px 4px 8px 6px #ffffff", WebkitBoxShadow: "-13px 4px 8px 6px #FFFFFF" }} className=" clickable bg-base-100 w-12 h-8 flex items-center justify-center">
                    <FaSearch className="text-2xl" />
                </button>}


                <div className={"transition-all absolute inset-0 z-20 w-full " + (search === null ? " hidden " : " flex justify-end items-center ")}>
                    <input onBlur={() => {
                        if (search === "") setSearch(null)
                    }} ref={searchInputRef} autoFocus={true} type="text" value={search} onChange={(e) => setSearch(e?.target?.value || "")} className={" input input-sm text-base  transition-all pr-8 " + (search === null ? " w-[0%] " : " w-[100%] ")} placeholder="Search" />
                </div>

                {search !== null && <>
                    <div className="absolute top-0 bottom-0 -left-4 bg-base-100 p-4" />
                    <BsX onClick={() => setSearch(null)} className="absolute bg-base-100 right-2 text-2xl z-30" />
                </>}
            </div>

            <div id="divider-1" className=" w-full flex items-center justify-center">
                <div className="w-full py-[1px] rounded-full bg-neutral/25" />
            </div>
            {search !== null && search?.length > 0 ?
                <PlaysetQueryList name={"search-" + debouncedSearch} loading={search !== debouncedSearch} mutateQuery={(query) => {

                    // const searchSplit = (search || "").split(" ");

                    // query.textSearch("description", `${searchSplit.map(s => `'${s}'`).join(" & ")}`, {
                    //     config: "english",
                    // });

                    query.ilike("name", `%${search}%`)

                    return query;
                }} onPlaysetClick={onPlaysetClick} />
                :
                <>
                    {activeTab?.filterFn && <PlaysetQueryList name={activeTab?.value} mutateQuery={activeTab?.filterFn} onPlaysetClick={onPlaysetClick} infinite={activeTab?.infinite} refetchEveryTime={activeTab?.refetchEveryTime} extraSelect={activeTab?.extraSelect} needsLogin={activeTab?.needsLogin} />}
                    {activeSubTab?.filterFn && <PlaysetQueryList name={activeSubTab?.value} mutateQuery={activeSubTab?.filterFn} onPlaysetClick={onPlaysetClick} infinite={activeSubTab?.infinite} refetchEveryTime={activeSubTab?.refetchEveryTime} extraSelect={activeSubTab?.extraSelect} needsLogin={activeSubTab?.needsLogin} />}
                    {/* {activeTab?.component && <activeTab.component key={activeTab?.value + (activeSubTab?.value || "")} onPlaysetClick={onPlaysetClick} />} */}
                </>
            }
        </div>
    );
}




export function NavTabsComponent({ activeTab, setActiveTab, activeSubTab, setActiveSubTab, search, hidden }) {
    return (
        <div className={"animate__animated animate__fadeIn animate__faster items-center w-full justify-start overflow-x-scroll scrollbar-hide gap-2 -ml-4 pl-4 pr-2 " + (search === null ? " opacity-100 " : " opacity-0 ") + (hidden ? " hidden " : " flex ")}>
            {TABS.map(tab => {
                return (
                    <Pill style={{ fontSize: "1rem", height: "1.8rem", paddingLeft: "1rem", paddingRight: "1rem" }} onClick={() => {
                        if (tab?.subTags) setActiveSubTab(tab?.subTags[0]);
                        setActiveTab(tab)
                    }} Icon={tab?.icon} textColor={tab?.color} border={activeTab?.value === tab?.value} borderColor={activeTab?.value === tab?.value ? null : "transparent"} >
                        {tab.name} {tab?.subTags && <span className="-mr-2 -ml-1"><IoMdArrowDropdown /></span>}
                    </Pill>
                )
            })}

        </div>
    )
}


function SubTabsComponent({ activeTab, setActiveTab, activeSubTab, setActiveSubTab, search, hidden }) {

    function handleBack() {
        setActiveTab(TABS[0])
        setActiveSubTab("")
    }
    return (
        <div className={"animate__animated animate__fadeIn animate__faster justify-start items-center gap-2 w-full " + (search === null ? " opacity-100 " : " opacity-0 ") + (hidden ? " hidden " : " flex ")}>
            <BiArrowBack onClick={() => handleBack()} className="text-xl" />
            <Pill onClick={() => handleBack()} style={{ fontSize: "1rem", height: "1.8rem", paddingLeft: "1rem", paddingRight: "1rem" }} Icon={activeTab?.icon} textColor={activeTab?.color} border  >
                <span className="-mr-2 -ml-1"><IoMdArrowDropup /></span>
            </Pill>
            <div id="divider-2" className="  h-6 flex items-center justify-center -mr-2">
                <div className=" h-6 px-[1px] rounded-full bg-neutral/25" />
            </div>
            <div className={"flex items-center w-full justify-start overflow-x-scroll scrollbar-hide gap-2 -mr-4 pr-4 pl-2 "}>
                {activeTab?.subTags?.map(tab => {
                    return (
                        <Pill style={{ fontSize: "1rem", height: "1.8rem", paddingLeft: "1rem", paddingRight: "1rem" }} onClick={() => setActiveSubTab(tab)} Icon={tab?.icon} textColor={tab?.color} border={activeSubTab?.value === tab?.value} borderColor={activeSubTab?.value === tab?.value ? null : "transparent"} >
                            {tab.name}
                        </Pill>
                    )
                })}

            </div>
        </div>
    )
}