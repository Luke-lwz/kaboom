import React from 'react';
import FilterBar from './FilterBar';
import useLocalStorage from 'use-local-storage';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import supabase from '../../../../supabase';
import { useContext, useEffect, useMemo, useRef } from 'preact/hooks';
import { PageContext } from '../../../PageContextProvider';
import PlaysetDisplay from '../../PlaysetDisplay';
import { maximizePlayset } from '../../../../helpers/playsets';

import { observeElementInViewport } from 'observe-element-in-viewport';



const METADATA_FIELDS = ['verified', 'hidden', 'official', 'dev'];

const elementsPerPage = 20;



function PlaysetQueryList(props) {
    const {
        name = "undefined",
        mutateQuery = (query) => query, // never do select() on the supabase query
        overrideQuery,
        onPlaysetClick = (playset) => { },
        infinite = true,
        refetchEveryTime = false,
        loading: _loading,
    } = props;

    const { devMode, user } = useContext(PageContext);


    const loaderRef = useRef(null);




    const [activeToggles, setActiveToggles] = useLocalStorage(`active-toggles-object`, {
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
        isLoading,
        isError,
    } = useInfiniteQuery({
        queryKey: [name, user?.id, devMode, activeToggles?.playerNumber, refetchEveryTime, ...activeTogglesArray],
        queryFn: queryFn,
        staleTime: devMode || refetchEveryTime ? 1000 * 0 : 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchOnMount: devMode || refetchEveryTime,
        refetchOnWindowFocus: devMode || refetchEveryTime,
        refetchOnReconnect: false,
        retry: false,

        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
            return pages?.length * elementsPerPage;
        },
    })

    const loading = isLoading || _loading;


    const { playsets, concatenatedPlaysets } = useMemo(() => {
        const concatenatedPlaysets = data?.pages?.map(page => page).flat() || [];
        const minimizedPlaysets = concatenatedPlaysets || [];
        const maximizedPlaysets = minimizedPlaysets.map(playset => maximizePlayset(playset));
        const filteredPlaysets = maximizedPlaysets.filter(playset => {
            if (!devMode && playset?.playsets_metadata?.dev) return false;
            return true
        })
        return { playsets: filteredPlaysets, concatenatedPlaysets };
    }, [data])

    useEffect(() => {
        if (loaderRef.current) {
            const inHandler = (entry, unobserve, targetEl) => {
                // console.log('In viewport')
                const length = concatenatedPlaysets?.length;
                if (length % elementsPerPage !== 0 || length <= 0 || !infinite) return;
                fetchNextPage()
            }

            // handler for when target is NOT in viewport
            const outHandler = (entry, unobserve, targetEl) => console.log('')

            var unobserve = observeElementInViewport(loaderRef.current, inHandler, outHandler, {
                // set viewport
                viewport: null,

                // decrease viewport top by 100px
                // similar to this, modRight, modBottom and modLeft exist
                modTop: '-100px',

                // threshold tells us when to trigger the handlers.
                // a threshold of 90 means, trigger the inHandler when atleast 90%
                // of target is visible. It triggers the outHandler when the amount of
                // visible portion of the target falls below 90%.
                // If this array has more than one value, the lowest threshold is what
                // marks the target as having left the viewport
                threshold: [90]
            })

        }

        return (() => unobserve?.())



    }, [loaderRef.current, concatenatedPlaysets, fetchNextPage, infinite])


    async function queryFn({ queryKey, pageParam }) {
        const [name, userId, devMode, playerNumber, refetchEveryTime, ...activeToggles] = queryKey;


        const offset = pageParam || 0;
        const limit = elementsPerPage;

        var query = supabase
            .from('playsets')
            .select(`*,playsets_metadata(*),interaction:interactions(*),upvote_count:interactions(count),downvote_count:interactions(count),i_count:interactions(upvote.count())`)
            .eq('upvote_count.upvote', true)
            .eq('downvote_count.upvote', false)
            .eq('interaction.user_id', userId || "00000000-0000-0000-0000-000000000000")


            // add the limit and offset
            .range(offset, offset + limit - 1)




        if (overrideQuery) {
            query = overrideQuery(query)
        } else {



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


            query = mutateQuery(query);

        }

        const { data, error } = await query;

        console.log("error", error)

        if (error) throw Error(error);


        return data
    }






    return (
        <div className='w-full h-fit flex flex-col items-center justify-center gap-4'>
            <FilterBar name={name} activeToggles={activeToggles} setActiveToggles={setActiveToggles} />
            {isError ?
                <div className="w-full flex py-4 items-center justify-center text-sm text-red-600/50">An error occurred</div>
                :

                loading ? <div className="w-full flex py-4 items-center justify-center"><span className="loading loading-spinner "></span></div>
                    :
                    playsets?.length === 0 ? <div className="w-full flex py-4 items-center justify-center text-sm text-base-300">No playsets found</div>
                        :
                        <>
                            {playsets?.map(playset => (
                                <PlaysetDisplay key={playset?.id} playset={playset} onClick={() => onPlaysetClick(playset)} showPills />
                            ))}
                            <button ref={loaderRef}></button>
                        </>
            }

        </div>
    );
}

export default PlaysetQueryList;