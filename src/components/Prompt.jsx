import { useEffect, useState } from "react";

function Prompt({ title, text, onApprove = () => { }, onCancel = () => { }, element, noCancel }) { // element overwrites everything (even onApprove())

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true)
    }, [])

    return (
        <div className='absolute inset-0 z-[100] bg-black/50 flex justify-center items-center ' onClick={() => (element || noCancel ? "" : onCancel())}>
            <div div className={'mx-4 w-full max-w-md bg-white text-black shadow-lg  rounded-xl flex flex-col justify-start items-center p-4 ' + (loaded ? " animate-in " : " animate-out ") + (element ? " h-fit " : " h-fit ")} >
                {element ? element : <>
                    <div className='grow flex flex-col items-start justify-start w-full p-3 pointer-events-none'>
                        <h1 className='text-2xl font-extrabold truncate w-full pb-2'>
                            {title ? title : "Are you sure?"}
                        </h1>
                        <p className='text-lg w-full leading-5'>
                            {text}
                        </p>
                    </div>
                    <div className='flex items-center justify-end w-full gap-1'>
                        {!noCancel && <button className='btn btn-ghost' onClick={() => onCancel()}>Cancel</button>}
                        <button className='btn btn-primary' onClick={() => onApprove()}>Okay</button>
                    </div>
                </>}
            </div >


        </div >
    );
}

export default Prompt;
