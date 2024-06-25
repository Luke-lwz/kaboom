import React from 'react';
import FilterBar from './FilterBar';
import useLocalStorage from 'use-local-storage';
import { useQuery } from '@tanstack/react-query';
import supabase from '../../../../supabase';
import { useContext, useMemo } from 'preact/hooks';
import { PageContext } from '../../../PageContextProvider';
import PlaysetDisplay from '../../PlaysetDisplay';
import { maximizePlayset } from '../../../../helpers/playsets';



const METADATA_FIELDS = ['verified', 'hidden', 'official', 'dev'];



function PlaysetQueryList(props) {
    const {
        name = "undefined",
        mutateQuery = (query) => query, // never do select() on the supabase query
        onPlaysetClick = (playset) => { },
    } = props;

    const { devMode, hasPermission } = useContext(PageContext);


    const [activeToggles, setActiveToggles] = useLocalStorage(`active-toggles-${name}`, {
        verified: false,
        hidden: false,
        official: false,
        dev: false,
        playerNumber: null
    });

    const activeTogglesArray = useMemo(() => Object.entries(activeToggles).filter(([key, value]) => !!value).map(([key, value]) => key), [activeToggles])

    console.log(activeTogglesArray)

    const { data } = useQuery({ 
        queryKey: [name, devMode, activeToggles?.playerNumber, ...activeTogglesArray], 
        queryFn: queryFn,
        staleTime: devMode ? 0 : 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
     })


     const playsets = useMemo(() => {
        const minimizedPlaysets = data?.data || [];
        const maximizedPlaysets = minimizedPlaysets.map(playset => maximizePlayset(playset));
        console.log(maximizedPlaysets)
        return maximizedPlaysets; 
     }, [data])


    async function queryFn({ queryKey }) {
        const [name, devMode, playerNumber, ...activeToggles] = queryKey;

        const query = supabase
            .from('playsets')
            .select(`*,playsets_metadata(*),interaction:interactions(*),upvote_count:interactions(count),downvote_count:interactions(count)`)
            .eq('upvote_count.upvote', true)
            .eq('downvote_count.upvote', false)



        if (!devMode) {
            query.eq('playsets_metadata.dev', false)
        }




        let addedMetadataExistsFilter = false;

        METADATA_FIELDS.forEach(field => {
            if (activeToggles.includes(field)) {

                if (!addedMetadataExistsFilter) { // adds the metadata exists filter if it does not exist yet
                    query.not('playsets_metadata', 'is', null)
                    addedMetadataExistsFilter = true;

                }

                if (field !== "dev" || devMode) query.eq(`playsets_metadata.${field}`, true);


            }
        })


        // non boolean fields


        if (playerNumber) {

            console.log(playerNumber)
            query.lte('min_players', playerNumber)
            query.gte('max_players', playerNumber)
        }











        // check if metadata exists 




        // if (activeToggles.includes('verified')) {
        //     query.eq('playsets_metadata.verified', false)
        // }



        const { data, error } = await query;

        console.log(data, error);


        return { data, error }
    }



    return (
        <div className='w-full h-fit flex flex-col items-center justify-center gap-4'>
            <FilterBar name={name} activeToggles={activeToggles} setActiveToggles={setActiveToggles} />
            {playsets?.map(playset => (
                <PlaysetDisplay key={playset?.id} playset={playset} onClick={() => onPlaysetClick(playset)} showPills />
            ))}
        </div>
    );
}

export default PlaysetQueryList;