import moment from "moment";


export function generateGame(playerCount) {
    let game = {created_at: moment().format("x"), phase: "rooms", round: 1} // phases are "room", "rounds", "boom"


    game.rounds = generateDefaultRounds(playerCount);
    



    return game;

}



export function generateDefaultRounds(playerCount) {
    if (playerCount >= 2) {
        return [
            {
                time: 5, // minutes
                hostages: 5
            },
            {
                time: 4, // minutes
                hostages: 4
            },
            {
                time: 3, // minutes
                hostages: 3
            },
            {
                time: 2, // minutes
                hostages: 2
            },
            {
                time: 1, // minutes
                hostages: 1
            },
        ]
    } else if (playerCount >= 18) {
        return [
            {
                time: 5, // minutes
                hostages: 4
            },
            {
                time: 4, // minutes
                hostages: 3
            },
            {
                time: 3, // minutes
                hostages: 2
            },
            {
                time: 2, // minutes
                hostages: 1
            },
            {
                time: 1, // minutes
                hostages: 1
            },
        ]
    } else if (playerCount >= 14) {
        return [
            {
                time: 5, // minutes
                hostages: 3
            },
            {
                time: 4, // minutes
                hostages: 2
            },
            {
                time: 3, // minutes
                hostages: 2
            },
            {
                time: 2, // minutes
                hostages: 1
            },
            {
                time: 1, // minutes
                hostages: 1
            },
        ]
    } else if (playerCount >= 8) {
        return [
            {
                time: 3, // minutes
                hostages: 2
            },
            {
                time: 2, // minutes
                hostages: 1
            },
            {
                time: 2, // minutes
                hostages: 1
            },
        ]
    } else {
        return [
            {
                time: 3, // minutes
                hostages: 2
            },
            {
                time: 2, // minutes
                hostages: 1
            },
            {
                time: 1, // minutes
                hostages: 1
            },
        ]
    }
}