import { useState } from "react";

import { motion } from "framer-motion";

function Menu({ onCancel = () => { }, children }) {

    const [drag, setDrag] = useState(0);


    return (
        <div className='absolute inset-0 z-[99] bg-black/50 flex w-full justify-between items-center p-4 '>


            <div className="flex flex-col justify-center items-center h-full w-full">
                <div onClick={onCancel} className="grow w-full" />
                <div className="flex items-center justify-center w-full">

                    <div onClick={onCancel} className="grow h-full " />

                    <motion.div
                        className={'animate__animated animate__zoomIn  duration-150 animate__faster max-w-[50rem] shrink w-fit  max-h-[29rem] text-black rounded-lg flex flex-col justify-center items-center overflow-hidden transition-all '}
                        drag="y"
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        dragSnapToOrigin
                        dragConstraints={{
                            top: 0.1,
                            bottom: 0,
                        }}
                        onDrag={
                            (event, info) => {
                                setDrag(Math.floor(info.offset.y))
                            }
                        }
                        onDragEnd={() => {
                            if (drag > 70) {
                                onCancel();
                            }

                            setDrag(0)
                        }}
                    >
                        {children}
                    </motion.div >

                    <div onClick={onCancel} className="grow h-full " />

                </div>

                <div onClick={onCancel} className="grow w-full" />


            </div>


        </div >
    );
}

export default Menu;
