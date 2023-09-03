import React from 'react';

function BannerBoxWithImage({ src, children, href, noTarget = false }) {
    return (
        <a href={href} target={noTarget ? "" : "_blank"} className=' px-4 w-full flex items-center justify-center clickable'>
            <div className='bg-base-200 flex items-center w-full max-w-2xl p-2 gap-2 rounded-lg h-20 '>
                <div className='overflow-hidden rounded h-fit w-16 '>
                    <img src={src} alt="" />
                </div>
                <div className='flex flex-col items-start'>
                    {children}
                </div>
            </div>
        </a>
    );
}


export function BlankBannerBox({ children, onClick = () => { } }) {
    return (
        <div onClick={onClick} className=' px-4 w-full flex items-center justify-center clickable'>
            <div className='bg-base-200 flex items-center w-full max-w-2xl p-2 gap-2 rounded-lg h-20 '>
                {children}
            </div>
        </div>
    );
}

export function NeutralBlankBannerBox({ children, onClick = () => { } }) {
    return (
        <div onClick={onClick} className=' px-4 w-full flex items-center justify-center clickable'>
            <div className='bg-neutral text-neutral-content flex items-center w-full max-w-2xl p-2 gap-2 rounded-lg'>
                {children}
            </div>
        </div>
    );
}

export default BannerBoxWithImage;
