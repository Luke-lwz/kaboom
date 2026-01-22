

import { BsDiscord } from "react-icons/bs"
import { FcGoogle } from "react-icons/fc"

import supabase from "../../supabase";
import {toast} from "react-hot-toast";

export default function LoginMenu() {


    async function loginGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        })
        if (error) toast.error("Error at login!")
    }

    async function loginDiscord() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: { redirectTo: window.location.origin }
        })
        if (error) toast.error("Error at login!")
    }

    return (
        <div className='w-full max-w-[22rem] h-fit rounded-lg flex flex-col items-center overflow-hidden bg-base-100 transition-all p-4 gap-4'>
            <div className="px-[50vw] -my-2"></div>

            <div className="rounded-lg shadow overflow-hidden border-base-200 border-2 h-20 w-20">
                <img src={"/login.png"} className="w-full h-full" />
            </div>

            <h2 className="font-extrabold text-2xl -mt-2">Kaboom login!</h2>

            <div className="flex flex-col w-full items-center gap-2">
                <LoginButton onClick={() => loginDiscord()} Icon={<BsDiscord />} style={{ backgroundColor: "#5865F2", color: "#ffffff", border: "2px solid #5865F2" }}>Discord</LoginButton>
                <LoginButton onClick={() => loginGoogle()} Icon={<div className="rounded-full p-1.5 bg-white -m-1.5"><FcGoogle size={20} /></div>} style={{ backgroundColor: "#4c8bf5", color: "#ffffff", border: "2px solid #4c8bf5" }}>Google</LoginButton>
            </div>

            <p className="text-xs font-light text-neutral/60 w-full text-center px-4">
                By logging in, you agree to our <a href="/privacy" className="underline">Privacy Policy</a> and <a href="/terms" className="underline">Terms of Service</a>
                <br />
                We only use essential cookies!
            </p>
        </div >
    );
}


export function LoginButton({ Icon, children, className, style, onClick = () => { } }) {
    return (
        <button onClick={onClick} style={style} className={"clickable px-4 py-2 text-xl font-extrabold cursor-pointer flex flex-row items-center justify-start w-full rounded-md gap-4 " + " " + style}>
            {Icon}
            <p>{children}</p>
        </button>
    )
}