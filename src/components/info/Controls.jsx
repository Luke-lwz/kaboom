function Controls() {
    return (
        <>
            <span className="text-secondary font-extrabold">Card reveal:</span><br />
            To reveal or hide your card, <b>tap it.</b><br />
            This can be used to card share aswell.
            <br /><span className="text-secondary font-extrabold">Color reveal:</span><br />
            To reveal your color simply <b>swipe down on your card.</b> (Card face must be closed)<br />
            When less than 11 players: Disabled. (Can be enabled by host)
            <br /><span className="text-secondary font-extrabold">See all cards in game:</span><br />
            Click the <b>info icon</b> in the upper right corner of your screen.<br/>
            Now you can see all cards that are distributed among your friends
            <br /><span className="text-secondary font-extrabold">Swap cards:</span><br />
            Open your card face and <b>swipe up.</b><br/>
            Select a player with whom you want to swap cards and wait for them to accept or deny the request
            <br /><br /><span className="text-primary font-extrabold">Timer menu:</span> (Host)<br />
            <b>Click the timer</b> to open the menu.<br />
            You now have the following options:
            <ul className="list-disc pl-8">
                <li><b>Pause/Resume</b> game</li>
                <li>End the <b>round</b> prematurely</li>
                <li>End the <b>game</b> prematurely</li>
            </ul>

        </>
    );
}

export default Controls;