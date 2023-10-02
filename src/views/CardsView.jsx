import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContext } from '../components/PageContextProvider';

// helpers
import { getAllCards, getCardFromId } from '../helpers/cards';

//icons
import { TbCardsFilled } from "react-icons/tb"

// components
import { CardFront } from '../components/Card';
import CardInfoMenu from '../components/menus/CardInfoMenu';
import Menu from '../components/Menu';
import { toast } from 'react-hot-toast';

import { useSearchParams } from 'react-router-dom'
import { TitleBar } from './playsets/WorkbenchView';
import CardsFilter from '../components/CardsFilter';






function CardsView({ }) {

    const { setMenu } = useContext(PageContext)

    let [searchParams, setSearchParams] = useSearchParams();













    return (
        <div className='flex flex-col justify-start items-center w-full h-full  overflow-x-hidden relative scrollbar-hide'>
            <TitleBar titleElement={
                <>
                    <TbCardsFilled size={27} />
                    <h1>Cards</h1>
                </>
            } />
            <div className='-mt-2 w-full p-2 pt-0'>
                <CardsFilter onSearchUpdate={(search) => setSearchParams("s=" + search)} defaultSearch={searchParams.get("s")} onClick={(card) => setMenu(
                    <CardInfoMenu card={card} color={card?.color}  />
                )} />
            </div>
        </div>
    );
}

export default CardsView;