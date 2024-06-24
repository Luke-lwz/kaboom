import { useContext, useCallback } from "react";

import { useQuery } from "@tanstack/react-query";
import supabase from "../../../supabase";
import { useEffect } from "react";
import { maximizePlayset } from "../../../helpers/playsets";

import PlaysetDisplay from "../PlaysetDisplay";
import { PageContext } from "../../PageContextProvider";
import PlaysetQueryList from "./_components/PlaysetQueryList";


export default function NewPage({ onPlaysetClick = (playset) => { } }) {

    const { user } = useContext(PageContext);



    const getPlaysets = useCallback(async (user) => {



        const { data, error } = await supabase
            .from('playsets')
            .select(`*,playsets_metadata(*),interaction:interactions(*),upvote_count:interactions(count),downvote_count:interactions(count)`) // ,user:users_id(*)
            .eq('interaction.user_id', user?.id || "00000000-0000-0000-0000-000000000000")
            .eq('upvote_count.upvote', true)
            .eq('downvote_count.upvote', false)
            .order('created_at', { ascending: false })
        if (data) {
            console.log(data);
        } else {
            console.log(error)
        }
        return data?.map(playset => maximizePlayset(playset)) || [];
    }, [user])


    // useQuery
    const query = useQuery({ queryKey: ['playsets-new'], queryFn: () => getPlaysets(user), })
    const { data: playsets, error, isLoading, isError } = query




    useEffect(() => {
        if (!user?.id) return () => {};
        query?.refetch()

    }, [user, query])

    return (
        <div className="w-full flex flex-col items-center justify-start gap-2">
            <PlaysetQueryList name="new" />
            {/* {playsets?.map(playset => (
                <PlaysetDisplay key={playset?.id} playset={playset} onClick={() => onPlaysetClick(playset)} showPills />
            ))} */}
        </div>
    )
}