

const DIFFICULTIES = [
    {
        name: "Beginner",
        key: "beginner",
        colors: {
            primary: "",
            secondary: ""
        }
    },
    {
        name: "Advanced",
        key: "advanced",
        colors: {
            primary: "",
            secondary: ""
        }
    },
    {
        name: "Intermediate",
        key: "intermediate",
        colors: {
            primary: "",
            secondary: ""
        }
    },
    {
        name: "Expert",
        key: "expert",
        colors: {
            primary: "",
            secondary: ""
        }
    },
    {
        name: "Master",
        key: "master",
        colors: {
            primary: "",
            secondary: ""
        }
    },
]



export function getDifficultyDataFromValue(value) {
    const index = (Math.ceil(value / 2) -1); // gets index from number from 1-10
    const diff = DIFFICULTIES[index] || DIFFICULTIES[0];
    return {...diff, difficulty: value}
}


