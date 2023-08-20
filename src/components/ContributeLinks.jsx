
function ContributeLinks(props) {
    return (
        <div className="w-full flex flex-col items-center max-w-md gap-2 px-10 my-4">
            <h1 className="text-title font-extrabold text-2xl py-4">Contribute</h1>
            <Link className="bg-[#1b1f23] border-4 border-[#1b1f23] text-white font-bold text-2xl " src="/github.png" href="https://github.com/Luke-lwz/kaboom">
                GitHub
            </Link>
            <Link className="bg-[#5562ea] border-4 border-[#5562ea] p-0.5 pl-2.5" src="/discordbanner.png" href="https://discord.gg/EmDbDm6PMz">

            </Link>
            <Link className="bg-[#fd0] border-4 border-[#fd0] pl-2.5 " src="/buymeacoffeebanner.png" href="https://www.buymeacoffee.com/lukas.fish">

            </Link>
            <Link className="bg-[#1a2532] border-4 border-[#1a2532] text-white font-bold text-xl gap-4 " src="/spercoolpictureofme.png" href="https://bento.me/lukasimurr">
                Other projects
            </Link>

            
        </div>
    );
}



function Link ({src = "", href ="/", children, className = ""}) {
    return (
        <a href={href} target="_blank" className={" shadow-lg hover:shadow-xl transition-all hover:scale-105 clickable rounded-full h-14 p-1.5 w-full flex justify-start items-center gap-3 " + className}>
            <img className="h-full" src={src} alt="" />
            {children}
        </a>
    )
}

export default ContributeLinks;
