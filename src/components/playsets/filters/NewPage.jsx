import { useQuery } from "@tanstack/react-query";
import supabase from "../../../supabase";
import { useEffect } from "react";
import { maximizePlayset } from "../../../helpers/playsets";


export default function NewPage({ onPlaysetClick = (playset) => { } }) {


    // useQuery
    const query = useQuery({ queryKey: ['todos'], queryFn: getPlaysets })
    const { data: playsets, error, isLoading, isError } = query

    async function getPlaysets() {
        const { data, error } = await supabase
            .from('playsets')
            .select(`*,playsets_metadata(*)`)
            .or("playsets_metadata.is.null,playsets_metadata->hidden.neq.true")
            .order('created_at', { ascending: false })
        if (data) {
            console.log(data);
        } else {
            console.log(error)
        }
        return data?.map(playset => maximizePlayset(playset)) || [];
    }


    useEffect(() => {
        getPlaysets()
    }, [])

    return (
        <div className="w-full flex flex-col items-center justify-start">

        </div>
    )
}