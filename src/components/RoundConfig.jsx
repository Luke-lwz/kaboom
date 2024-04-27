import { BsFillDoorOpenFill, BsStopwatch } from "react-icons/bs";
import { FaMinus, FaPlus } from "react-icons/fa";
import { PiPersonSimpleRunBold } from "react-icons/pi";


const minuteArray = [...Array(99).keys()].map(i => i + 1);
const hostagesArray = [...Array(99).keys()].map(i => i + 1);

export default function RoundConfig({ roundConfig, onRowDelete = () => { }, onTimeChange, onHostagesChange, onAddRound, color, highlightRound }) {
    return (
        <div style={{ gap: "1px", color }} className='bg-neutral rounded-2xl border-2 border-neutral overflow-hidden text-base text-title grid grid-cols-3 w-full  font-extrabold'>



            <TableCell >
                {/* <IoRemoveCircle className='text-2xl text-neutral/70' /> */}
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
                    <TableCell highlight={index + 1 === highlightRound} onClick={() => onRowDelete(index)}>
                        <span className='text-base-content pr-1'>Round</span><span>{index + 1}</span>
                    </TableCell>
                    <TableCell highlight={index + 1 === highlightRound}>
                        {onTimeChange ?
                            <select name="Round time" onChange={(e) => onTimeChange(e.target.value, index)} className='text-base-content w-fit text-center h-6 bg-gray-200 rounded-full px-1'>

                                {minuteArray.map(i => <option selected={i === round?.time} value={i}>{i} min</option>)}


                            </select>
                            :
                            <span className='text-base-content pr-1'>{round?.time} min</span>
                        }
                    </TableCell>
                    <TableCell highlight={index + 1 === highlightRound}>
                        {onHostagesChange ?
                            <select name="Hostages" onChange={(e) => onHostagesChange(e.target.value, index)} className='text-base-content w-fit h-6 bg-gray-200 rounded-full px-1'>

                                {hostagesArray.map(i => <option selected={i === round?.hostages} value={i}>{i}</option>)}


                            </select>
                            :
                            <span className='text-base-content pr-1'>{round?.hostages}</span>
                        }
                    </TableCell>
                </>
            ))}



            {onAddRound && <div className='w-full bg-base-100  flex items-center justify-center h-12 col-span-3'>
                <div style={{ color }} className='font-bold text-sm h-full w-full flex items-center justify-center '>
                    <button onClick={() => onRowDelete(roundConfig?.length -1 || 0) } className='w-full  h-full flex items-center justify-center gap-1 clickable '>
                        <FaMinus /> Round
                    </button>
                    <div className="h-full border border-neutral"></div>
                    <button onClick={onAddRound} className='w-full h-full flex items-center justify-center gap-1 clickable '>
                        <FaPlus /> Round
                    </button>
                </div>
            </div>}
        </div>
    );
}


function TableCell({ children, tooltip, onClick = () => { }, highlight = false }) {
    return (
        <div onClick={onClick} className='tooltip w-full' data-tip={tooltip}>
            <div className={'w-full bg-base-100 flex items-center justify-center h-12 ' + (highlight ? " bg-base-200 " : " bg-base-100 ")} >
                {children}
            </div>
        </div>
    )
}
