import { useState } from 'react';

import { BsXLg } from "react-icons/bs"

export default function PageCover({ title, element, onClose = () => {} }) {
    return (
        <div className='fixed inset-0 bg-neutral/30 p-2 z-[97]'>
            <div className='bg-base-100 rounded-lg w-full h-full flex flex-col items-center justify-start relative overflow-hidden'>
                <div onClick={onClose} className='flex font-extrabold w-full text-base-content items-center justify-between text-title text-lg sm:text-xl p-2 sm:p-3 md:p-4 md:text-2xl border-b border-neutral'>
                    <h1>{title}</h1>
                    <BsXLg />
                </div>
                <div className='overflow-y-scroll scrollbar-hide grow w-full flex flex-col items-center p-2'>
                    {element}
                </div>
            </div>

        </div>
    );
}