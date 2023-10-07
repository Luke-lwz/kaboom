

const DIFFICULTIES = [
    {
        name: "Beginner",
        key: "beginner",
        colors: {
            primary: "#0ca6e8",
            secondary: "#0ca6e815"
        }
    },
    {
        name: "Advanced",
        key: "advanced",
        colors: {
            primary: "#11b837",
            secondary: "#11b83715"
        }
    },
    {
        name: "Intermediate",
        key: "intermediate",
        colors: {
            primary: "#ffc400",
            secondary: "#ffc40015"
        }
    },
    {
        name: "Expert",
        key: "expert",
        colors: {
            primary: "#eb421c",
            secondary: "#eb421c15"
        }
    },
    {
        name: "Master",
        key: "master",
        colors: {
            primary: "#901eba",
            secondary: "#901eba15"
        }
    },
]



export function getDifficultyDataFromValue(value) {
    let roundedValue = Math.round(value);
    const index = (Math.ceil(roundedValue / 2) - 1); // gets index from number from 1-10
    const diff = DIFFICULTIES[index] || DIFFICULTIES[0];
    return { ...diff, difficulty: Math.round( value * 10 ) / 10 }
}


export function avg(numbers = []) {
    if (cards.length <= 1) return numbers?.[0] || 4;

    const sum = numbers.reduce((acc, cur) => acc + cur);
    const average = sum / numbers.length;
    return average;
}


export function avgFromCards(cards) {
    if (cards.length <= 1) return cards?.[0]?.difficulty || 4;

    const sum = cards.map(c => c.difficulty).reduce((acc, cur) => acc + cur);
    const average = sum / cards.length;
    return average;
}


