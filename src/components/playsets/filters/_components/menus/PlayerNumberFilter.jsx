

import React from 'react';
import RangeCounter from '../../../../RangeCounter';
import useLocalStorage from 'use-local-storage';

function PlayerNumberFilter({ onClear = () => {}, onChange = () => {}, currentValue = null}) {
    console.log(currentValue)
    const [number, setNumber] = useLocalStorage("player-number-filter", currentValue || 10);
    return (
        <div className={"bg-base-100 w-full p-4 flex flex-col items-start justify-center gap-4 rounded-lg"}>
            <h1 className={"text-xl font-extrabold tracking-tighter"}>Filter player number</h1>
            <RangeCounter min={"6"} value={number} onChange={setNumber} />
            <div className='w-full flex items-center justify-end gap-2'>
                <button onClick={() => onClear()} className={'btn bg-black text-white ' + (!currentValue ? " btn-disabled " : " ")}>Clear</button>
                <button onClick={() => onChange(parseInt(number))} className='btn btn-primary'>Apply</button>
            </div>
        </div>
    )
}

export default PlayerNumberFilter;