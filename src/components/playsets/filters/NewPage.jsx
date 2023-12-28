import supabase from "../../../supabase";
import { useEffect } from "react";


export default function NewPage({onPlaysetClick = (playset) => {}}) {

    
    // useQuery


    async function getPlaysets() {
        const { data, error } = await supabase
            .from('playsets')
            .select(`*`)
            .order('created_at', { ascending: false })
        if (data) {
            console.log(data);
        } else  {
            console.log(error)
        }
    }

    useEffect(() => {
        getPlaysets()
    }, [])

    return (
        <div className="w-full flex flex-col items-center justify-start">
            <h1>New Page</h1>
        </div>
    )
}