"use client";

import { User } from "@notion-kit/schemas";
import { TooltipPreset } from "@notion-kit/shadcn";
import { idToColor } from "@notion-kit/utils";

import { UserAvatar } from "./_components";

const MAX_SHOWN_USERS = 1;

interface ParticipantsProps {
  currentUser?: User;
  otherUsers?: User[];
}

export const Participants: React.FC<ParticipantsProps> = ({
  currentUser,
  otherUsers = [],
}) => {
  const hasMoreUsers = otherUsers.length > MAX_SHOWN_USERS;

  return (
    <div className="flex items-center">
      {currentUser && (
        <UserAvatar
          borderColor={idToColor(currentUser.id)}
          user={currentUser}
          className="ml-[-8px]"
        />
      )}
      {otherUsers.slice(0, MAX_SHOWN_USERS).map((user) => (
        <UserAvatar
          borderColor={idToColor(user.id)}
          key={user.id}
          user={user}
          className="ml-[-8px]"
        />
      ))}
      {hasMoreUsers && (
        <TooltipPreset
          description={`Viewed by ${otherUsers.length - MAX_SHOWN_USERS} more people`}
          sideOffset={10}
        >
          <div className="ml-2 text-sm whitespace-nowrap text-secondary select-none">{`+${otherUsers.length - MAX_SHOWN_USERS}`}</div>
        </TooltipPreset>
      )}
    </div>
  );
};
