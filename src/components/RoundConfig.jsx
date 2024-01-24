import { BsFillDoorOpenFill, BsPlus, BsStopwatch } from "react-icons/bs";
import { PiPersonSimpleRunBold } from "react-icons/pi";


const minuteArray = [...Array(99).keys()].map(i => i + 1);
const hostagesArray = [...Array(99).keys()].map(i => i + 1);

export default function RoundConfig({ roundConfig, onRowDelete = () => { }, onTimeChange, onHostagesChange, onAddRound, color }) {
    return (
        <div style={{ gap: "1px", color }} className='bg-neutral rounded-2xl border-2 border-neutral overflow-hidden text-base text-title grid grid-cols-3 w-full  font-extrabold mt-2'>
            <TableCell>
                <></>
            </TableCell>
            <TableCell tooltip={"Round time"} >
                <BsStopwatch className='text-2xl' />

            </TableCell>
            <TableCell>
                <PiPersonSimpleRunBold className='text-xl' />
                <BsFillDoorOpenFill style={{ transform: "scaleX(-1)" }} className='text-2xl' />
            </TableCell>


            {roundConfig?.map((round, index) => (
                <>
                    <TableCell onClick={() => onRowDelete(index)}>
                        <span className='text-base-content pr-1'>Round</span><span>{index + 1}</span>
                    </TableCell>
                    <TableCell>
                        {onTimeChange ?
                            <select name="Round time" onChange={(e) => onTimeChange(e.target.value, index)} className='text-base-content w-fit text-center'>

                                {minuteArray.map(i => <option selected={i === round?.time} value={i}>{i} min</option>)}


                            </select>
                            :
                            <span className='text-base-content pr-1'>{round?.time} min</span>
                        }
                    </TableCell>
                    <TableCell>
                        {onHostagesChange ?
                            <select name="Hostages" onChange={(e) => onHostagesChange(e.target.value, index)} className='text-base-content w-fit'>

                                {hostagesArray.map(i => <option selected={i === round?.hostages} value={i}>{i}</option>)}


                            </select>
                            :
                            <span className='text-base-content pr-1'>{round?.hostages}</span>
                        }
                    </TableCell>
                </>
            ))}



            {onAddRound && <div className='w-full bg-base-100 p-3 flex items-center justify-center h-12 col-span-3'>
                <div style={{color}} className='font-bold text-sm gap-1 w-full '>
                    <button onClick={onAddRound} className='w-full flex items-center justify-center gap-1 clickable'>
                        <BsPlus size={24} /> Round
                    </button>
                </div>
            </div>}
        </div>
    );
}


function TableCell({ children, tooltip, onClick = () => { } }) {
    return (
        <div onClick={onClick} className='tooltip w-full' data-tip={tooltip}>
            <div className='w-full bg-base-100 flex items-center justify-center h-12' >
                {children}
            </div>
        </div>
    )
}
