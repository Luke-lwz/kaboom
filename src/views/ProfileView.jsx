import { useParams } from "react-router-dom";
import { useContext, useMemo, useState, useEffect } from "react"
import { PageContext } from "../components/PageContextProvider";

import supabase from "../supabase";
import { TitleBar } from "./playsets/WorkbenchView";
import { IoPersonCircleOutline } from "react-icons/io5";


export default function ProfileView({ }) {
    const { id } = useParams();

    const { smoothNavigate, user } = useContext(PageContext)

    const [profile, setProfile] = useState(null);



    useEffect(() => {
        getProfile();
    }, [id])


    async function getProfile() {

        let { data: profiles, error } = await supabase
            .from('profiles')
            .select("*")
            .eq('id', id || user?.id || "")

        console.log(profiles, error)

        if (!profiles?.[0]) smoothNavigate("/")
        setProfile(profiles?.[0] || null)


    }

    if (!profile) return <div className="w-full flex flex-col items-center">
        <TitleBar titleElement={
            <>
                <IoPersonCircleOutline className="text-2xl md:text-3xl text-orange-500" />
                <h1 onClick={() => smoothNavigate("/playsets")} className="text-orange-500">PROFILE</h1>
            </>
        } />

        <div className="loading loading-spinner" />
    </div>

    return <div className="w-full flex flex-col items-center">
        <TitleBar titleElement={
            <>
                <IoPersonCircleOutline className="text-2xl md:text-3xl text-orange-500" />
                <h1 onClick={() => smoothNavigate("/playsets")} className="text-orange-500">PROFILE</h1>
            </>
        } />

        <div className="w-full max-w-md flex flex-col items-center">
            profile

        </div>
    </div>


}
