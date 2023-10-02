import { useMemo } from 'react';
import { getDifficultyDataFromValue } from '../helpers/difficulty';

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




export function DifficultyPill({ difficulty = 7, minimal = false }) {
    const difficultyData = useMemo(() => getDifficultyDataFromValue(difficulty), [difficulty])
    return (
        <Pill bgColor={difficultyData?.colors?.secondary} textColor={difficultyData?.colors?.primary} tooltip={"Difficulty: " + (difficultyData?.difficulty || 7)}>
            <div className={'-ml-1 flex items-center justify-center ' + (minimal ? " -mr-1 " : "")}>

                <SmallRadialProgress value={(difficultyData?.difficulty || 7) * 10} />
            </div>
            {!minimal && <div className='ml-0.5'>
                {difficultyData?.name}
            </div>}
        </Pill>
    )
}



export function WhiteDifficultyPill({ difficulty = 7, minimal = false }) {
    const difficultyData = useMemo(() => getDifficultyDataFromValue(difficulty), [difficulty])
    return (
        <Pill bgColor={"#ffffff20"} tooltip={"Difficulty: " + (difficultyData?.difficulty || 7)}>
            <div className={'-ml-1 flex items-center justify-center ' + (minimal ? " -mr-1 " : "")}>

                <SmallRadialProgress value={(difficultyData?.difficulty || 7) * 10} />
            </div>
            {!minimal && <div className='ml-0.5'>
                {difficultyData?.name}
            </div>}
        </Pill>
    )
}







export function SmallRadialProgress({ value = 30, color, text = "" }) {
    return (
        <div className="radial-progress" style={{ "--value": value, "--size": "0.8rem", "--thickness": "0.15rem", color }}>{text}</div>
    )
}

