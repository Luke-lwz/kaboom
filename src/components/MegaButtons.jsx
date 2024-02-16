import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";

import { useEffect, useState, useCallback } from "react";
import { BsPencilFill, BsStars } from "react-icons/bs";
import { FaPlus, FaTrash } from "react-icons/fa";


export default function MegaButton({ Icon, children, textColor, bgColor, bgBaseify = false, tooltip, fill = false, onClick = () => { }, title, className }) {
    return (
        <>
            <button onClick={onClick} title={title} className={'rounded-md w-fit tooltip clickable group ' + (bgBaseify ? " bg-base-100 " : " bg-transparent ") + (tooltip ? "  " : "  ") + (fill ? " w-full " : " w-fit ") + " " + className} data-tip={tooltip}>
                <div style={{ backgroundColor: textColor, color: "#ffffff" }} className={'text-md h-14  rounded-md px-4 min-w-[2rem] py-2 flex items-center justify-center font-extrabold gap-3 ' + (fill ? " w-full " : " w-fit ")}>
                    {Icon && <div className='text-xl flex items-center justify-center'>
                        {Icon}
                    </div>}
                    {children}
                </div>
            </button>
        </>
    );
}





export function BookmarkMegaButton({ bookmarked = false, onChange = () => { } }) {

    const [marked, setMarked] = useState(bookmarked);

    useEffect(() => {
        setMarked(bookmarked);
    }, [bookmarked])


    const handleChange = useCallback(() => {
        setMarked(!marked);
        onChange(!marked);
    }, [marked, onChange]);


    return (
        <MegaButton title="Bookmark" Icon={marked ? <IoBookmark /> : <IoBookmarkOutline />} fill textColor={"#72c4ff"} onClick={() => handleChange()}>
            <div className="">Bookmark{marked ? "ed" : ""}</div>
        </MegaButton>
    )
}



export function RemixButton({ onClick = () => { } }) {
    return (
        <MegaButton title="Remix" Icon={<BsStars />} fill textColor="#fad623" onClick={() => onClick()}>
            <div className="">Remix</div>
        </MegaButton>
    )
}


export function EditPlaysetButton({ onClick = () => { } }) {
    return (
        <MegaButton title="Edit" Icon={<BsPencilFill className="text-lg" />} fill textColor="#7e22ce" onClick={() => onClick()}>
            <div className="">Edit</div>
        </MegaButton>
    )
}


export function DeletePlaysetButton({ onClick = () => { } }) {
    return (
        <MegaButton title="Delete" Icon={<FaTrash className="text-lg" />} fill textColor={"#fc021b"} onClick={() => onClick()}>
            <div className="">Delete</div>
        </MegaButton>
    )
}



export function BigAbsoluteMakeButton({ onClick = () => { } }) {
    return (
        <MegaButton title="Make" Icon={<FaPlus className="text-lg" />} textColor={"#fc021b"} className={" drop-shadow-2xl absolute bottom-4 right-4 z-10"} onClick={() => onClick()}>
            <div className="hidden sm:block">Make</div>
        </MegaButton>
    )
}