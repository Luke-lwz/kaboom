import { useState } from 'react';

import { BsXLg } from "react-icons/bs"

export default function PageCover({ title, element }) {
    return (
        <div className='fixed inset-0 bg-neutral/30 p-2'>
            <div className='bg-base-100 rounded-lg w-full h-full flex flex-col items-center justify-start relative'>
                <div className='flex text-base-content items-center justify-between text-title text-lg absolute top-0 left-0 right-0 bg-blue-700'>
                    <h1>{title}</h1>
                    <BsXLg />
                </div>
                <div className='overflow-y-scroll scrollbar-hide'>

                    {element}
                </div>
            </div>

        </div>
    );
}