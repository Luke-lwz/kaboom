import { useMemo } from "react"

import Avatar, { genConfig } from 'react-nice-avatar-vite-prod-fork'
import { IoPersonCircleOutline } from "react-icons/io5";

export function UserAvatar({ profile, className }) {

    const avaConfig = useMemo(() => {
        if (profile?.profile_metadata?.kaboom?.name || profile?.name || profile?.id) {

            return genConfig(profile?.profile_metadata?.kaboom?.name || profile?.name || profile?.id);
        } else {
            return null
        }
    }, [profile])

    return (
        <div className={'rounded-full ' + className}>
            {avaConfig ? <Avatar className="w-full h-full" {...avaConfig} />
                :
                <IoPersonCircleOutline className="" />
            }
        </div>
    );
}