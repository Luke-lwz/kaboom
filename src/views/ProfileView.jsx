import { useParams } from "react-router-dom";
import { useContext, useMemo, useState, useEffect } from "react"
import { PageContext } from "../components/PageContextProvider";

import supabase from "../supabase";


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

            setProfile(profiles?.[0] || null)
            // else smoothNavigate("/")


    }

    return (
        <div>

        </div>
    );
}
