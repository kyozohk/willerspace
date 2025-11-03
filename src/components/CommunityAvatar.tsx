import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function CommunityAvatar({className}: {className?: string}) {
    return (
        <Avatar className={cn("h-12 w-12", className)}>
            <AvatarImage src="/Willer community desktop@2x.png" alt="Willer Community" />
            <AvatarFallback>WC</AvatarFallback>
        </Avatar>
    )
}
