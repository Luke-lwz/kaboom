import { useParams } from "react-router-dom";
import { useContext, useMemo, useState, useEffect, useRef } from "react"
import supabase from "../../supabase";
import { PageContext } from "../../components/PageContextProvider";
import { maximizePlayset } from "../../helpers/playsets.js"

import PlaysetDisplay from "../../components/playsets/PlaysetDisplay"
import Pill from "../Pills.jsx";


import { MdOutlineWbIridescent } from "react-icons/md";
import { VscVerifiedFilled } from "react-icons/vsc";
import { BsFillCheckSquareFill, BsX } from "react-icons/bs";
import { GiFireBomb } from "react-icons/gi";
import { FaSearch } from "react-icons/fa";


const TABS = [
    {
        name: "New",
        value: "new",
        color: "#02f771",
        icon: <MdOutlineWbIridescent className="text-base" />,
    },
    {
        name: "Hot",
        value: "hot",
        color: "#f72b02",
        icon: <GiFireBomb className="text-base" />,
    },
    {
        name: "Verified",
        value: "verified",
        color: "#1c96e8",
        icon: <VscVerifiedFilled className="text-base" />,
    },
    {
        name: "Official",
        value: "official",
        color: "#000000",
        icon: <BsFillCheckSquareFill className="text-sm mr-0.5" />,
    },
]


export default function PlaysetsFilter({ onClick = () => { } }) {
    const { id } = useParams();

    const { smoothNavigate, user } = useContext(PageContext)

    const [playsets, setplaysets] = useState([]);

    const [activeTab, setActiveTab] = useState(TABS[0]?.value)

    const [search, setSearch] = useState(null);


    const searchInputRef = useRef(null);



    useEffect(() => {
        getPlaysets();
    }, [id])

    useEffect(() => {
        if (search !== null) searchInputRef.current.focus()
    }, [search])


    async function getPlaysets() {

        let { data: playsets, error } = await supabase
            .from('playsets')
            .select("*")

        setplaysets(playsets)
        // else smoothNavigate("/")


    }

    return (
        <div className="w-full max-w-3xl flex flex-col gap-4 p-4 items-center pb-64">
            <div className={"flex justify-between items-center w-full relative transition-all "}>
                <div className={"flex items-center w-full justify-start overflow-x-scroll scrollbar-hide gap-2 -ml-4 pl-4 pr-2 " + + (search === null ? " opacity-100 " : " opacity-0 ")}>
                    {TABS.map(tab => {
                        return (
                            <Pill style={{ fontSize: "1rem", height: "1.8rem", paddingLeft: "1rem", paddingRight: "1rem" }} onClick={() => setActiveTab(tab?.value)} Icon={tab?.icon} textColor={tab?.color} border={activeTab === tab?.value} borderColor={activeTab === tab?.value ? null : "transparent"} >
                                {tab.name}
                            </Pill>
                        )
                    })}

                </div>
                <button onClick={() => setSearch("")} style={{boxShadow: "-13px 4px 8px 6px #ffffff", WebkitBoxShadow: "-13px 4px 8px 6px #FFFFFF"}} className=" clickable bg-base-100 w-12 h-8 flex items-center justify-center">
                    <FaSearch className="text-2xl" />
                </button>


                <div className={"transition-all absolute inset-0 z-20 w-full " + (search === null ? " hidden " : " flex justify-end items-center ")}>
                    <input onBlur={() => {
                        if (search === "") setSearch(null)
                    }} ref={searchInputRef} autoFocus={true} type="text" value={search} onChange={(e) => setSearch(e?.target?.value || "")} className={" input input-sm text-base  transition-all pr-8 " + (search === null ? " w-[0%] " : " w-[100%] ")} placeholder="Search" />
                </div>
                
                {search !== null && <>
                <div className="absolute top-0 bottom-0 -left-4 bg-base-100 p-4"/>
                <BsX onClick={() => setSearch(null)} className="absolute bg-base-100 right-2 text-2xl z-30" />
                </>}
            </div>

            <div id="divider-1" className=" w-full flex items-center justify-center">
                <div className="w-full py-[1px] rounded-full bg-neutral/25" />
            </div>
            {playsets?.map(playset => {
                const max = maximizePlayset(playset)
                return (
                    <>
                        <PlaysetDisplay showClosedPills playset={max} onClick={() => onClick(max?.id)} />
                    </>
                )
            })}
        </div>
    );
}
