import React, { useEffect, useMemo } from 'preact/compat';
import { BsFillCheckSquareFill } from 'react-icons/bs';
import { HiUsers } from 'react-icons/hi2';
import {  TbCardsFilled } from 'react-icons/tb';
import { VscVerifiedFilled } from 'react-icons/vsc';
import useLocalStorage from 'use-local-storage';




function FilterBar(props) {
    const { name = "undefined" } = props;

    const [activeToggles, setActiveToggles] = useLocalStorage('active-toggles', []);

    function handleClick(id) {
        setActiveToggles((prev) => {

            if (prev.includes(id)) {
                return prev.filter((item) => item !== id) || [];
            } else {
                return [...prev, id];
            }
        });
    }


    return (
        <div className='w-full flex items-center gap-2 h-14'>
            <FilterToggleWrapper id='verified' color="#1c96e8" activeToggles={activeToggles} handleClick={handleClick}>
                <VscVerifiedFilled  />
            </FilterToggleWrapper>

            <FilterToggleWrapper id='official' color="#000000" activeToggles={activeToggles} handleClick={handleClick}>
                <BsFillCheckSquareFill className='text-xl' />
            </FilterToggleWrapper>
            <FilterToggleWrapper id='card' color="#3b82f6" activeToggles={activeToggles} handleClick={handleClick}>
                <TbCardsFilled />
            </FilterToggleWrapper>

            <FilterToggleWrapper id='player_count' color="#ff0000" activeToggles={activeToggles} handleClick={handleClick}>
                <HiUsers />
            </FilterToggleWrapper>
        </div>
    );
}


const GRAYSCALE_COLOR = "#BDBDBD";

function FilterToggleWrapper(props) {
    const { id, color: _color, children, activeToggles,  handleClick = (id) => {} } = props;

    

    const isActive = useMemo(() => {
        return activeToggles.includes(id);
    }, [activeToggles, id]);


    const color =  isActive ? _color : GRAYSCALE_COLOR;



    return (
        <div style={{ borderColor: color , color:  color, backgroundColor:  color + "22" }} onClick={() => handleClick(id)} className={'text-2xl clickable flex items-center justify-center bg-base-200/50 border-2 h-14 min-w-[3.5rem] rounded-lg '}>
            <div class={"w-full h-full flex items-center justify-center" + (isActive ? " animate__animated animate__rubberBand animate__faster " : " ")}>
                {children}
            </div>
        </div>
    );
}

export default FilterBar;