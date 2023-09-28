

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
        name: "Beginner",
        key: "beginner",
        colors: {
            primary: "",
            secondary: ""
        }
    },
    {
        name: "Beginner",
        key: "beginner",
        colors: {
            primary: "",
            secondary: ""
        }
    },
    {
        name: "Beginner",
        key: "beginner",
        colors: {
            primary: "",
            secondary: ""
        }
    },
    {
        name: "Beginner",
        key: "beginner",
        colors: {
            primary: "",
            secondary: ""
        }
    },
]



export function getDifficultyDataFromValue(value) {
    const index = ""
    const diff = DIFFICULTIES[index] || DIFFICULTIES[0];
    return {...diff, difficulty: value}
}


