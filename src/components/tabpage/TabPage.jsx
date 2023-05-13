import React from 'react';

function TabPage({ children, className, style }) {
    return (
        <div style={style} className={'animate__animated animate__fadeIn animate__faster ' + className}>
            {children}
        </div>
    );
}


export function TabRow({ children }) {
    return (
        <div className='flex justify-start items-center gap-2 w-full overflow-x-scroll scrollbar-hide p-4 transition-all px-5'>
            {children}
        </div>
    )
}


export function Tab({ color, onClick = () => { }, selected, title = "Option", data }) { // data will be sent back onClick (if no data then title will be sent)
    return (
        <div onClick={() => onClick(data || title)} style={{ backgroundColor: (selected ? (color ? `${color}40` : "#dedede") : "#dedede"), color: (selected ? (color ? color : "black") : "#000000"), borderColor: (selected ? (color ? color : "black") : "#dedede") }} className={' whitespace-nowrap rounded-full h-8 py-0.5 px-5 font-semibold flex items-center justify-center transition-all border-2 ' + (selected ? "  " : "  ")}>
            {title}
        </div>
    )
}

export default TabPage;