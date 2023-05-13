import React from 'react';
import BannerBoxWithImage from './BannerBoxWithImage';

function LinkToTwoRoomsBox({ }) {
    return (
        <BannerBoxWithImage href="http://tworoomsandaboom.com" src="traab_image.png">
            <h2 className='-mb-1 text-md'>Check out the original!</h2>

            <h1 className='font-extrabold text-xl'>Two Rooms and a Boom&trade;</h1>
        </BannerBoxWithImage>
    );
}

export default LinkToTwoRoomsBox;