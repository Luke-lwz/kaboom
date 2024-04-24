/*
admin
playset_mod
user_mod
insights
announcements
*/


type Role = "admin" | "playset_mod" | "user_mod" | "insights" | "announcements"

export type Roles = {
    role: Role,
    displayName: string
}[]


export const roles: Roles = [
    {
        role: "admin",
        displayName: "Admin",
    },
    {
        role: "playset_mod",
        displayName: "Playset Mod",
    },
    {
        role: "user_mod",
        displayName: "User Mod",
    },
    {
        role: "insights",
        displayName: "Insights",
    },
    {
        role: "announcements",
        displayName: "Announcements",
    },

]