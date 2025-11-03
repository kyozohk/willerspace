import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function CommunityAvatar({className}: {className?: string}) {
    return (
        <Avatar className={cn("h-12 w-12", className)}>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>WC</AvatarFallback>
        </Avatar>
    )
}
