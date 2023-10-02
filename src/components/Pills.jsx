import React from 'react';

export default function Pill({ Icon, children, textColor, bgColor, bgBaseify = false, tooltip }) {
    return (
        <>
            <div className={'rounded-full w-fit h-fit tooltip ' + (bgBaseify ? " bg-base-100 " : " bg-transparent ") + (tooltip ? "  " : "  ")} data-tip={tooltip}>
                <div style={{ backgroundColor: bgColor, color: textColor }} className='text-xs h-6 font bold  rounded-full px-3 min-w-[2rem] w-fit py-1 flex items-center justify-center font-bold gap-1 '>
                    {Icon && <div className='-ml-1 text-sm'>
                        <Icon />
                    </div>}
                    {children}
                </div>
            </div>
        </>
    );
}









export function SmallRadialProgress({value = 30, color = "#ffffff", text = ""}) {
    return (
        <div className="radial-progress" style={{"--value":value, "--size": "0.8rem", "--thickness": "0.15rem", color}}>{text}</div>
    )
}

