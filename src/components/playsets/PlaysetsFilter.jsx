import { useParams } from "react-router-dom";
import { useContext, useMemo, useState, useEffect } from "react"
import supabase from "../../supabase";
import { PageContext } from "../../components/PageContextProvider";
import { maximizePlayset } from "../../helpers/playsets.js"

import PlaysetDisplay from "../../components/playsets/PlaysetDisplay"



const TABS = [
    {
        name: "All",
        value: "all",
        color: "",
    },
    {
        name: "Official",
        value: "official",
        color: "",
    },
    {
        name: "Verified",
        value: "verified",
        color: "",
    }
]


export default function PlaysetsFilter({ onClick = () => { } }) {
    const { id } = useParams();

    const { smoothNavigate, user } = useContext(PageContext)

    const [playsets, setplaysets] = useState([]);



    useEffect(() => {
        getPlaysets();
    }, [id])


    async function getPlaysets() {

        let { data: playsets, error } = await supabase
            .from('playsets')
            .select("*")

        setplaysets(playsets)
        // else smoothNavigate("/")


    }

    return (
            <div className="w-full max-w-3xl flex flex-col gap-4 p-4 items-center pb-64">
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
