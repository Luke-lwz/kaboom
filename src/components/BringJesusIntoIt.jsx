import moment from "moment";

function BringJesusIntoIt(props) {
    return (
        <div className="w-full border-2 border-neutral rounded-xl p-2 flex flex-col items-center justify-start">
            <div className="w-full flex gap-3 items-center">
                <div className="h-12 w-12 rounded-md overflow-hidden">
                    <img src="/lukas.jpg" alt="" className={" block h-0 min-h-full object-cover w-full object-center overflow-hidden "} />
                </div>
                <b className="text-xl font-bold">Hi, Lukas here! 👋</b>
            </div>
            <div className=" pt-2 relative">
                I'm {moment().diff("2004-03-18", "years")} years old and I'm from Germany.
                <br/>
                I made this website to <B>bring people together.</B>
                <br/>
                <div className="mt-2"></div>
                But my dream is to become a youth pastor!
                <br />
                Why, you might ask?
                <br />
                <B>Because Jesus Christ has changed me:</B>
                <br/>
                <div className="mt-2"></div>
                I went from being someone who got <B>lost in seeking love and attention</B> from people and things that don't give any of that, to someone who's now filled with love and has direction.
                <br/>
                <div className="mt-2"></div>
                I went from being someone with a lot of burden from everything that I did wrong, to someone who can now stand and say that <B>I've been forgiven!</B>
                <br/>
                <div className="mt-2"></div>
                <B>My sins are forgiven in an act of grace on the cross</B>, because even though I deserved to be hung on that cross, he gave himself so I wouldn't have to suffer. 
                <br/>
                <div className="mt-2"></div>
                My advice for everyone who feels the same as I did: Give yourself to Jesus Christ and receive <B className="font-extrabold text-yellow-300">LIFE!</B>
                <br/>
                <div className="mt-4"></div>
                Also, thank you for coming to my site. Glad you're here!

            </div>
            <a href="https://www.gotquestions.org/" target="_blank" style={{backgroundColor: "rgb(253,224,71)"}} className={"rounded cursor-pointer text-white font-extrabold py-2 w-full mt-2 flex items-center justify-center"}>Got questions?</a>
        </div>
    );
}

function B({children, className =""}) {
    return (
        <span className={"font-bold " + className}>{children}</span>
    )
}

export default BringJesusIntoIt;