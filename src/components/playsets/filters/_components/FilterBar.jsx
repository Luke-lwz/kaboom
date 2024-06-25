import React, { useContext, useMemo } from 'preact/compat';
import { BsFillCheckSquareFill } from 'react-icons/bs';
import { HiUsers } from 'react-icons/hi2';
import { TbCardsFilled } from 'react-icons/tb';
import { VscVerifiedFilled } from 'react-icons/vsc';
import { PageContext } from "../../../PageContextProvider";
import { MdConstruction } from 'react-icons/md';
import PlayerNumberFilter from './menus/PlayerNumberFilter';


const CONFLICTS = [
    [
        "verified",
        "official",
        "dev",
    ]
]



function FilterBar(props) {
    const { activeToggles, setActiveToggles = () => { } } = props;

    const { devMode, setMenu2 } = useContext(PageContext)


    function handleBooleanClick(id) {
        setActiveToggles((prev) => {

            if (prev[id]) { // set to false
                return { ...prev, [id]: false }
            } else { // activate
                // conflicts
                for (const conflict of CONFLICTS) {
                    if (conflict.includes(id)) {
                        for (const c of conflict) {
                            if (prev[c]) {
                                return { ...prev, [c]: false, [id]: true }
                            }
                        }
                    }
                }

                return { ...prev, [id]: true }
            }

        });
    }


    function handleValueClick(id, value) {
        setActiveToggles((prev) => {
            return { ...prev, [id]: value }
        }
        );

        setMenu2(null);
    }


    function openUserFilterMenu() {
    console.log(activeToggles?.playerNumber)
        setMenu2(<PlayerNumberFilter
            onChange={(n) => handleValueClick("playerNumber", n)}
            onClear={() => handleValueClick("playerNumber", null)}
            currentValue={activeToggles?.playerNumber}
        />)
    }



    return (
        <div className='w-full flex items-center gap-2 h-14'>
            <FilterToggleWrapper id='verified' color="#1c96e8" activeToggles={activeToggles} handleClick={handleBooleanClick}>
                <VscVerifiedFilled />
            </FilterToggleWrapper>

            <FilterToggleWrapper id='official' color="#000000" activeToggles={activeToggles} handleClick={handleBooleanClick}>
                <BsFillCheckSquareFill className='text-xl' />
            </FilterToggleWrapper>


            {devMode && <FilterToggleWrapper id='dev' color="#fb923c" activeToggles={activeToggles} handleClick={handleBooleanClick}>
                <MdConstruction />
            </FilterToggleWrapper>}

            {/* <FilterToggleWrapper id='card' color="#3b82f6" activeToggles={activeToggles} handleClick={handleClick}>
                <TbCardsFilled />
            </FilterToggleWrapper> */}


            <FilterToggleWrapper id='playerNumber' color="#ff0000" activeToggles={activeToggles} handleClick={openUserFilterMenu}>
                <HiUsers />
                {activeToggles.playerNumber ? <div className='text-xl ml-2 font-extrabold'>{activeToggles.playerNumber}</div> : null}
            </FilterToggleWrapper>


        </div>
    );
}


const GRAYSCALE_COLOR = "#BDBDBD";

function FilterToggleWrapper(props) {
    const { id, color: _color, children, activeToggles, handleClick = (id) => { } } = props;



    const isActive = useMemo(() => {
        return activeToggles[id];
    }, [activeToggles, id]);


    const color = isActive ? _color : GRAYSCALE_COLOR;



    return (
        <div style={{ borderColor: color, color: color, backgroundColor: color + "22" }} onClick={() => handleClick(id)} className={'text-2xl clickable flex items-center justify-center bg-base-200/50 border-2 h-14 min-w-[3.5rem] rounded-lg '}>
            <div class={"w-full h-full flex items-center justify-center px-3.5" + (isActive ? " animate__animated animate__rubberBand animate__faster " : " ")}>
                {children}
            </div>
        </div>
    );
}

export default FilterBar;