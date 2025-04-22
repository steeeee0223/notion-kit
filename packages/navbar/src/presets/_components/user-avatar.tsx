import { cn } from "@notion-kit/cn";
import type { User } from "@notion-kit/schemas";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Avatar
            className={cn("size-6 border-2 select-none", className)}
            style={{ borderColor }}
          >
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="bg-main text-xs font-semibold">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>
          <div>{user.name}</div>
          <div className="font-normal">{user.email}</div>
          {/* <div className="min-w-[150px] py-0.5 leading-tight text-[rgba(206,205,202)]/60">
            Last viewed 1 day ago
          </div> */}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
