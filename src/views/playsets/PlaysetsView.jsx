import { useParams } from "react-router-dom";
import { useContext, useMemo, useState, useEffect } from "react"
import supabase from "../../supabase";
import { PageContext } from "../../components/PageContextProvider";
import PlaysetsFilter from "../../components/playsets/PlaysetsFilter";
import { BsCassetteFill } from "react-icons/bs";
import { TitleBar } from "./WorkbenchView";
import { BigAbsoluteMakeButton } from "../../components/MegaButtons";


export default function PlaysetsView({ onClick = () => { } }) {

    const { smoothNavigate, user } = useContext(PageContext)



    return (
        <div className="w-full flex flex-col items-center h-full  overflow-y-scroll">
            <TitleBar titleElement={ 
                <>
                    <BsCassetteFill className="text-2xl md:text-3xl" />
                    <h1 onClick={() => smoothNavigate("/playsets")}>Playsets</h1>
                </>
            } />
            <PlaysetsFilter onPlaysetClick={(playset) => smoothNavigate(`/playsets/${playset.id}`)} />
            <BigAbsoluteMakeButton onClick={() => smoothNavigate("/workbench")} />
        </div>
    );
}
