import React from 'react';

export default function Pill({ Icon, children, textColor, bgColor, bgBaseify = false }) {
    return (
        <>
            {bgBaseify && <div className='bg-base-100 rounded-full w-fit h-fit'></div>}
            <div style={{ backgroundColor: bgColor, color: textColor }} className='text-xs font bold bg-blue-400 rounded-full px-3 min-w-[2rem] w-fit py-1'>
                {children}
            </div>
        </>
    );
}

