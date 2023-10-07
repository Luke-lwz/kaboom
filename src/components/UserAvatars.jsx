import {useMemo} from "react"

import Avatar, { genConfig } from 'react-nice-avatar-vite-prod-fork'

export function UserAvatar({ user }) {

    const avaConfig = useMemo(() => {
        return genConfig(user?.user_metadata?.kaboom?.name || user?.id || "a");
    }, [user])

    return (
        <div className='rounded-full h-8 md:h-10 w-8 md:w-10'>
            <Avatar className="w-full h-full" {...avaConfig} />
        </div>
    );
}