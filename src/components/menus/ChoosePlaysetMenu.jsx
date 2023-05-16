import { useContext, useState, useMemo } from 'react';


import { getAllPlaysetsArray, getPlaysetsWithCards } from '../../helpers/playsets';
import PlaysetDisplay from '../playsets/PlaysetDisplay';

import TabPage, { TabRow, Tab } from '../tabpage/TabPage';
import { PageContext } from '../PageContextProvider';


const TABS = [
    {
        title: "Tutorial",
        playsetName: "tutorial"
    },
    {
        title: "Official",
        playsetName: "official"
    },
    {
        title: "Necroboomicon",
        playsetName: "necroboomicon"
    },
    {
        title: "Friends",
        playsetName: "friends"
    }
]

function ChoosePlaysetMenu({ onClick = () => { }, currentPlayset, playerCount }) {

    const { devMode } = useContext(PageContext)

    let playsets = getPlaysetsWithCards();
    let allPlaysets = getAllPlaysetsArray();

    const [tab, setTab] = useState("For you");

    const [forYou, setForYou] = useState(allPlaysets);


    useState(() => {
        // shuffle forYou
        let fy = sortPlaysets(allPlaysets, playerCount)// pushes certain elements to front
        fy = fy.filter(p => !p?.id?.startsWith("dev"));

        setForYou(fy);

    }, [playerCount])










    return (
        <div className='w-full h-fit rounded-xl flex flex-col items-center overflow-x-hidden overflow-y-scroll bg-base-100 transition-all scrollbar-hide'>
            <Section name="Selected Playset">
                <PlaysetDisplay playset={currentPlayset} forceOpen selected />
            </Section>
            <div className='w-full '>
                <h1 className='text-xl uppercase font-extrabold -mb-8 -mt-8 text-left p-5'>Playsets</h1>

                <TabRow>
                    <Tab title='For you' onClick={(d) => setTab(d)} color={"#eb387d"} selected={tab === "For you"} />
                    {TABS.map((TAB, i) =>
                        <Tab key={i} {...TAB} onClick={(d) => setTab(d)} color={playsets?.[TAB.playsetName]?.[0]?.color || TAB?.color} selected={tab === TAB.title} />
                    )}

                    {devMode && <Tab title='Development' onClick={(d) => setTab(d)} color={playsets?.["dev"]?.[0]?.color || TAB?.color} selected={tab === "Development"} />}



                </TabRow>
            </div>
            {TABS.map((TAB, i) => (playsets?.[TAB.playsetName] ?
                (tab === TAB.title && <PlaysetList key={i} playerCount={playerCount} playsets={playsets[TAB.playsetName]} currentPlayset={currentPlayset} />)
                :
                <></>
            ))}

            {tab === "For you" &&
                <TabPage className={'w-full flex flex-col gap-4 items-start justify-start px-5 pb-5'}>
                    {forYou.filter(p => p.id !== currentPlayset.id).map(p => <div key={p.id} className=' w-full '><PlaysetDisplay playset={p} onClick={() => onClick(p)} /></div>)}
                </TabPage>
            }

            {tab === "Development" && <TabPage className={'w-full flex flex-col gap-4 items-start justify-start px-5 pb-5'}>
                {playsets["dev"].filter(p => p.id !== currentPlayset.id).map(p => <div key={p.id} className=' w-full '><PlaysetDisplay playset={p} onClick={() => onClick(p)} /></div>)}
            </TabPage>}


        </div>
    );
}


export function calculatePlaysetDisabled(playset, playerCount) {
    const [min, max] = playset.players.split("-");
    return (playerCount < parseInt(min) || playerCount > parseInt(max))

}


function sortPlaysets(playset, playerCount, shuffle = true) {
    let pl = (shuffle ? playset.sort((a, b) => 0.5 - Math.random()) : playset);
    pl = pl.sort((x, y) => {
        var [xmin, xmax] = x.players.split("-");
        var [ymin, ymax] = y.players.split("-");
        return playerCount >= xmin && playerCount <= xmax ? -1 : playerCount >= ymin && playerCount <= ymax ? 1 : xmin - ymin;
    }); // pushes certain elements to front

    return pl;
}



function PlaysetList({ playsets, playerCount, currentPlayset }) {

    const sortedPlaysets = useMemo(() => sortPlaysets(playsets.filter(p => p.id !== currentPlayset.id), playerCount, false), [playsets])

    return (
        <TabPage className={'w-full flex flex-col gap-4 items-start justify-start px-5 pb-5'}>
            {sortedPlaysets.map(p => <div key={p.id} className=' w-full '><PlaysetDisplay playset={p} onClick={() => onClick(p)} /></div>)}
        </TabPage>
    )
}







export function Section({ name, children }) {
    return (
        <div className='flex flex-col w-full gap-4 mb-8 p-5'>
            <h1 className='text-xl uppercase font-extrabold -mb-2'>{name}</h1>
            <div className={'w-full flex flex-col gap-4 items-start justify-start'}>
                {children}
            </div>
        </div>
    )
}

export default ChoosePlaysetMenu;