import React from 'react';
import FilterBar from './FilterBar';
import useLocalStorage from 'use-local-storage';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import supabase from '../../../../supabase';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'preact/hooks';
import { PageContext } from '../../../PageContextProvider';
import PlaysetDisplay from '../../PlaysetDisplay';
import { maximizePlayset } from '../../../../helpers/playsets';

import { observeElementInViewport } from 'observe-element-in-viewport';



const METADATA_FIELDS = ['verified', 'hidden', 'official', 'dev'];

const elementsPerPage = 20;



function PlaysetQueryList(props) {
  const {
    name = "undefined",
    mutateQuery = (query, queryKey) => query, // never do select() on the supabase query
    extraSelect = "",
    overrideQuery,
    onPlaysetClick = (playset) => { },
    infinite = true,
    refetchEveryTime = false,
    loading: _loading,
    needsLogin = false
  } = props;

  const { devMode, user, showLoginMenu } = useContext(PageContext);


  const loaderRef = useRef(null);

  const logInToUse = useMemo(() => {
    if (needsLogin && !user) return true;
    return false;
  }, [needsLogin, user])




  const [activeToggles, setActiveToggles] = useLocalStorage(`active-toggles-object`, {
    verified: false,
    hidden: false,
    official: false,
    dev: false,
    playerNumber: null
  });

  const activeTogglesArray = useMemo(() => Object.entries(activeToggles).filter(([key, value]) => !!value).map(([key, value]) => key), [activeToggles])


  const queryFn = useCallback(async ({ queryKey, pageParam }) => {
    console.log("querying 🚨", pageParam)
    const [name, userId, devMode, playerNumber, refetchEveryTime, extraSelect, ...activeToggles] = queryKey;


    const offset = pageParam || 0;
    const limit = elementsPerPage;

    /* new view in postgres
    create or replace view
public.all_playsets_view with(security_invoker=true) as
select
p.id,
p.created_at,
p.updated_at,
p.name,
p.odd_card,
p.min_players,
p.max_players,
p.primaries,
p.cards,
p.default_cards,
p.emoji,
p.shuffle,
p.no_bury,
p.force_bury,
p.difficulty,
p.players,
p.user_id,
p.remixed_from,
p.color,
p.description,
pm.verified,
pm.official,
pm.hidden,
pm.hidden_reason,
pm.dev,
(
select
  count(*) as count
from
  interactions
where
  interactions.playset_id = p.id
  and interactions.upvote = true
) as upvote_count,
(
select
  count(*) as count
from
  interactions
where
  interactions.playset_id = p.id
  and interactions.upvote = false
) as downvote_count,
(
select
  interactions.upvote
from
  interactions
where
  interactions.playset_id = p.id
  and interactions.user_id = auth.uid ()
) as user_upvote,
(
select
  interactions.bookmark
from
  interactions
where
  interactions.playset_id = p.id
  and interactions.user_id = auth.uid ()
) as user_bookmarked,
(
select
  interactions.updated_at
from
  interactions
where
  interactions.playset_id = p.id
  and interactions.user_id = auth.uid ()
) as user_interaction_updated_at
from
playsets p
left join playsets_metadata pm on p.id = pm.id


    */


    //   const {data: view_data, error: view_error} = await supabase
    //     .from('all_playsets_view')
    //     .select(`*`)

    //     console.log("view_data  äää", view_data)

    var query = supabase
      .from('all_playsets_view')
      .select(`*` + extraSelect)


      // add the limit and offset
      .range(offset, offset + limit - 1)




    if (overrideQuery) {
      query = overrideQuery(query, queryKey)
    } else {




      if (!devMode) query.or("dev.is.null,dev.eq.false");


      METADATA_FIELDS.forEach(field => {
        if (activeToggles.includes(field)) {


          if (field !== "dev" || devMode) query.eq(`${field}`, true);


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


      query = mutateQuery(query, queryKey);

    }

    const { data, error } = await query;

    console.log("data", data)

    console.log("error", error)

    if (error) throw Error(error);


    return data
  }, [overrideQuery, mutateQuery])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    isFetching,
  } = useInfiniteQuery({
    queryKey: [name, user?.id, devMode, activeToggles?.playerNumber, refetchEveryTime, extraSelect, ...activeTogglesArray],
    queryFn: queryFn,
    staleTime: devMode || refetchEveryTime || user?.id ? 1000 * 0 : 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: devMode || refetchEveryTime || user?.id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: false,

    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.length <= 0) return undefined;
      return pages?.length * elementsPerPage;
    },
    enabled: !logInToUse
  })

  const loading = isLoading || _loading;




  const { playsets, concatenatedPlaysets } = useMemo(() => {
    const concatenatedPlaysets = data?.pages?.map(page => page).flat() || [];
    const minimizedPlaysets = concatenatedPlaysets || [];
    const maximizedPlaysets = minimizedPlaysets.map(playset => maximizePlayset(playset));
    // const filteredPlaysets = maximizedPlaysets.filter(playset => {
    //   if (!devMode && playset?.playsets_metadata?.dev) return false;
    //   return true
    // })
    return { playsets: maximizedPlaysets, concatenatedPlaysets };
  }, [data])

  useEffect(() => {
    if (loaderRef.current) {
      const inHandler = (entry, unobserve, targetEl) => {
        // console.log('In viewport')
        const length = concatenatedPlaysets?.length;
        if (!hasNextPage || length <= 0 || !infinite || isFetching) return; // 🚨❌❌ needs change, isnt foolproof
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



  }, [loaderRef.current, concatenatedPlaysets, fetchNextPage, infinite, isFetching, hasNextPage])









  return (
    <div className='w-full h-fit flex flex-col items-center justify-center gap-4'>
      <FilterBar name={name} activeToggles={activeToggles} setActiveToggles={setActiveToggles} />
      {logInToUse ?
        <button onClick={() => showLoginMenu()} className='btn btn-sm btn-secondary noskew'>Log in to see</button>
        :
        isError ?
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