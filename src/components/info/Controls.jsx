function Controls() {
    return (
        <>
            <span className="text-secondary font-extrabold">Card reveal:</span><br />
            To reveal or hide your card, <b>tap it.</b><br />
            This can be used to card share aswell.
            <br /><span className="text-secondary font-extrabold">Color reveal:</span><br />
            To reveal your color simply <b>swipe down on your card.</b> (Card face must be closed)<br />
            Disabled when less than 11 players. (Can be enabled by host)
            <br /><span className="text-secondary font-extrabold">See all cards in game:</span><br />
            Click the <b>cards icon</b> in the upper right corner of your screen.<br/>
            Now you can see all cards that are distributed among your friends
            <br /><span className="text-secondary font-extrabold">Swap cards:</span><br />
            Open your card face and <b>swipe up.</b><br/>
            Select a player with whom you want to swap cards and wait for them to accept or deny the request
            <br /><span className="text-secondary font-extrabold">Timer menu:</span><br />
            <b>Click the timer</b> to open the menu.<br />
            You can now see all rounds and their settings.<br />
            <span className="text-primary">Host</span> has the following options:
            <ul className="list-disc pl-8">
                <li><b>Pause/Resume</b> game</li>
                <li>End the <b>round</b> prematurely</li>
                <li>End the <b>game</b> prematurely</li>
            </ul>
            <br /><br /><span className="text-primary font-extrabold">Remote Party Mode</span> (Host)<br />
            <b>DO NOT USE WHEN PLAYING IN PERSON</b><br />
            Enable this and you can virtually and remotely card and color share.<br/>
            This is for lobbies that are playing online rather than in person. (via Discord, Zoom, ...)

        </>
    );
}

export default Controls;