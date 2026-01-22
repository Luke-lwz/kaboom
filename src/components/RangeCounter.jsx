
import { useEffect, useState } from "react"
import { BiPlus, BiMinus } from "react-icons/bi"

export default function RangeCounter({ value, onChange = () => { }, min = 0, max = 9999 }) {

    const [manual, setManual] = useState(false)

    function handleBlur(_newVal) {
        const newVal = parseInt(_newVal);
        console.log(newVal)
        setManual(false)
        if (!newVal) return 
        if (newVal > max) return onChange(parseInt(max));
        if (newVal < min) return onChange(parseInt(min));
        onChange(newVal)
    }

    useEffect(() => setManual(false), [value])


    return (
        <div className="w-fit flex items-center justify-center">
            <div onClick={() => onChange((value - 1 < min ? value : value - 1))} className="bg-base-100 border-2 border-neutral rounded-l w-8 h-8 flex items-center justify-center text-xl font-extrabold clickable">
                <BiMinus />
            </div>
            {manual ?
                <input type="number" autoFocus onBlur={(e) => handleBlur(e?.target?.value)} className="border-none flex items-center justify-center w-fit max-w-[3rem] bg-transparent text-neutral " defaultValue={value} />
                :
                <div onClick={() => setManual(true)} className="px-3 flex items-center items">
                    {value}
                </div>

            }
            <div onClick={() => onChange((value + 1 > max ? value : value + 1))} className="bg-base-100 border-2 border-neutral rounded-r w-8 h-8 flex items-center justify-center text-xl font-extrabold clickable">
                <BiPlus />
            </div>
        </div>
    )
}