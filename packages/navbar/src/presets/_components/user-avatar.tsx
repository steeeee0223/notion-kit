import { cn } from "@notion-kit/cn";
import type { User } from "@notion-kit/schemas";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

interface UserAvatarProps {
  user: User;
  borderColor?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  borderColor,
  className,
}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <TooltipPreset
        sideOffset={8}
        description={[
          { type: "default", text: user.name },
          { type: "default", text: user.email },
        ]}
        className="*:data-[tooltip-desc=1]:font-normal"
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
};
