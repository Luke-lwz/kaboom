import {BsCheckLg} from "react-icons/bs"



function SelectGrid({ children }) {
    return (
        <div className=" grid w-full gap-3 grid-cols-2 md:grid-cols-3 ">
            {children}
        </div>
    );
}


export function SelectGridBox({ children, color = "#0019fd", selected, onClick = () => {} }) {

    return (
        <div onClick={onClick} style={{ backgroundColor: color }} className={" w-full clickable rounded-lg flex flex-col h-fit items-center justify-center transition-all relative " + (selected ? " p-1 mb-3 " : " p-0")}>
            <div className={" w-full flex items-center justify-center transition-all bg-base-200 rounded-lg shadow " + (selected ? " p-0 " : " p-1 ")}>

                <div className={"w-full h-fit bg-base-100 rounded  flex items-center flex-col justify-center min-h-[5rem]"}>
                    {children}
                </div>
            </div>
            <div style={{ backgroundColor: color }} className={"w-8 h-8 rounded-full absolute -bottom-3 transition-all flex items-center justify-center text-white " + (selected ? "scale-100" : "scale-0")}>
                <BsCheckLg />
            </div>
        </div>
    )
}

export default SelectGrid;