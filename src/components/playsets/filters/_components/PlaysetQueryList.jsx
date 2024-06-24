import React from 'react';
import FilterBar from './FilterBar';


function PlaysetQueryList(props) {
    const { name = "undefined" } = props;





    return (
        <div className='w-full h-fit'>
            <FilterBar name={name} />
        </div>
    );
}

export default PlaysetQueryList;