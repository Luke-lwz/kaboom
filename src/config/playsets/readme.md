# playset structure


```
{
    "name": "My first game",
    "id": "o01", 
    "players": "6-17",
    "cards": [ // will automatically add "Red Team" and "Blue Team cards" at the end 
        "b001",
        "r001"
    ],
    "odd_card": "g008", // card that will be shuffled in when odd number of players (if (undefined || "") bury();) // b008 == "Gambler"
    "shuffle": false, // if false it will assign cards from top to bottom, if true it will shuffle all the cards but will make sure to always include either president or presidents daughter and bomber or matyr // also linked cards will get shuffled in together unless "bury"
    "no_bury": true // cant select the option to bury now // usually wehen no martyr and presidents daughter 
}
```