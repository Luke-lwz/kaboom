import React from 'react';
import FilterBar from './FilterBar';
import useLocalStorage from 'use-local-storage';
import { useQuery } from '@tanstack/react-query';
import supabase from '../../../../supabase';




function PlaysetQueryList(props) {
    const {
        name = "undefined",
        mutateQuery = (query) => query // never do select() on the supabase query
    } = props;


    const [activeToggles, setActiveToggles] = useLocalStorage(`active-toggles-${name}`, []);

    const { data } = useQuery({ queryKey: [name, ...activeToggles], queryFn: queryFn })


    async function queryFn({ queryKey }) {
        const [name, ...activeToggles] = queryKey;

        const query = supabase
            .from('playsets')
            .select(`*,playsets_metadata(verified,hidden,official,dev),interaction:interactions(*),upvote_count:interactions(count),downvote_count:interactions(count)`)
            .eq('upvote_count.upvote', true)
            .eq('downvote_count.upvote', false)
            .eq('playsets_metadata.verified', true) // does not work yet
            // check if metadata exists 



            

            // if (activeToggles.includes('verified')) {
            //     query.eq('playsets_metadata.verified', false)
            // }



            const {data, error} = await query;

            console.log(data, error);


            return {data, error}
    }



    return (
        <div className='w-full h-fit'>
            <FilterBar name={name} activeToggles={activeToggles} setActiveToggles={setActiveToggles} />
        </div>
    );
}

export default PlaysetQueryList;