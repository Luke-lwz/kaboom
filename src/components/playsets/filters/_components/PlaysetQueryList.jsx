import React from 'react';
import FilterBar from './FilterBar';
import useLocalStorage from 'use-local-storage';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import supabase from '../../../../supabase';
import { useContext, useMemo } from 'preact/hooks';
import { PageContext } from '../../../PageContextProvider';
import PlaysetDisplay from '../../PlaysetDisplay';
import { maximizePlayset } from '../../../../helpers/playsets';



const METADATA_FIELDS = ['verified', 'hidden', 'official', 'dev'];

const elementsPerPage = 10;



function PlaysetQueryList(props) {
    const {
        name = "undefined",
        mutateQuery = (query) => query, // never do select() on the supabase query
        onPlaysetClick = (playset) => { },
    } = props;

    const { devMode, hasPermission, user } = useContext(PageContext);


    const [activeToggles, setActiveToggles] = useLocalStorage(`active-toggles-object-${name}`, {
        verified: false,
        hidden: false,
        official: false,
        dev: false,
        playerNumber: null
    });

    const activeTogglesArray = useMemo(() => Object.entries(activeToggles).filter(([key, value]) => !!value).map(([key, value]) => key), [activeToggles])


    const {
        data,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: [name, user?.id, devMode, activeToggles?.playerNumber, ...activeTogglesArray],
        queryFn: queryFn,
        staleTime: devMode ? 1000 * 15 : 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchOnMount: devMode,
        refetchOnWindowFocus: devMode,
        refetchOnReconnect: false,

        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
            return pages?.length * elementsPerPage;
        },
    })


    const playsets = useMemo(() => {
        const concatenatedPlaysets = data?.pages?.map(page => page).flat() || [];
        console.log(concatenatedPlaysets)
        const minimizedPlaysets = concatenatedPlaysets || [];
        const maximizedPlaysets = minimizedPlaysets.map(playset => maximizePlayset(playset));
        const filteredPlaysets = maximizedPlaysets.filter(playset => {
            if (!devMode && playset?.playsets_metadata?.dev) return false;
            return true
        })
        return filteredPlaysets;
    }, [data])


    async function queryFn({ queryKey,pageParam }) {
        const [name, userId, devMode, playerNumber, ...activeToggles] = queryKey;


        const offset = pageParam || 0;
        const limit = elementsPerPage;

        const query = supabase
            .from('playsets')
            .select(`*,playsets_metadata(*),interaction:interactions(*),upvote_count:interactions(count),downvote_count:interactions(count)`)
            .eq('upvote_count.upvote', true)
            .eq('downvote_count.upvote', false)
            .eq('interaction.user_id', userId || "00000000-0000-0000-0000-000000000000")
            

            // add the limit and offset
            .range(offset, offset + limit - 1)








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
            query.lte('min_players', playerNumber)
            query.gte('max_players', playerNumber)
        }











        // check if metadata exists 




        // if (activeToggles.includes('verified')) {
        //     query.eq('playsets_metadata.verified', false)
        // }



        const { data, error } = await query;

        if (error) throw Error(error);


        return data
    }



    return (
        <div className='w-full h-fit flex flex-col items-center justify-center gap-4'>
            <FilterBar name={name} activeToggles={activeToggles} setActiveToggles={setActiveToggles} />
            {playsets?.map(playset => (
                <PlaysetDisplay key={playset?.id} playset={playset} onClick={() => onPlaysetClick(playset)} showPills />
            ))}
            <button onClick={() => {fetchNextPage()}}>next</button>
        </div>
    );
}

export default PlaysetQueryList;