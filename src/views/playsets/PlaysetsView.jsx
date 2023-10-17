import { useParams } from "react-router-dom";
import { useContext, useMemo, useState, useEffect } from "react"
import supabase from "../../supabase";
import { PageContext } from "../../components/PageContextProvider";
import PlaysetsFilter from "../../components/playsets/PlaysetsFilter";


export default function PlaysetsView({ onClick = () => { } }) {

    const { smoothNavigate, user } = useContext(PageContext)



    return (
        <div className="w-full flex flex-col items-center h-screen  overflow-y-scroll">
            <PlaysetsFilter onClick={(id) => smoothNavigate(`/playsets/${id}`)} />
        </div>
    );
}
