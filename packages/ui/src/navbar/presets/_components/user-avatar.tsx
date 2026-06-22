import { cn } from "@notion-kit/cn";
import type { User } from "@notion-kit/schemas";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  TooltipDescription,
  TooltipPreset,
  TooltipProvider,
} from "@/primitives";

interface UserAvatarProps {
  user: User;
  borderColor?: string;
  className?: string;
}

export function UserAvatar({ user, borderColor, className }: UserAvatarProps) {
  return (
    <TooltipProvider>
      <TooltipPreset
        sideOffset={8}
        description={
          <>
            <TooltipDescription text={user.name} />
            <TooltipDescription text={user.email} className="font-normal" />
          </>
        }
      >
        <Avatar
          className={cn("size-6 border-2 select-none", className)}
          style={{ borderColor }}
        >
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-main text-xs font-semibold">
            {user.name[0]}
          </AvatarFallback>
        </Avatar>
      </TooltipPreset>
    </TooltipProvider>
  );
}
