import React from "react";

import { cn } from "@notion-kit/cn";
import { Hint } from "@notion-kit/common";
import { Badge, Button, Separator } from "@notion-kit/shadcn";

interface SettingsSectionProps extends React.PropsWithChildren {
  title: string;
  className?: string;
  hideSeparator?: boolean;
}
const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  className,
  hideSeparator = false,
  children,
}) => (
  <div className="p-0">
    <h3 className="pb-3 text-base font-medium">{title}</h3>
    {!hideSeparator && <Separator className="mb-4" />}
    <div className={cn("space-y-[18px]", className)}>{children}</div>
  </div>
);

interface SettingsPlanProps {
  plan: string;
  onClick?: () => void;
}
const SettingsPlan: React.FC<SettingsPlanProps> = ({ plan, onClick }) => (
  <Hint
    description="Upgrade to use this feature. Click to learn more."
    className="w-[174px]"
  >
    <Button
      tabIndex={0}
      variant="hint"
      className="ml-2 flex size-auto"
      onClick={onClick}
    >
      <Badge variant="blue" size="sm" className="whitespace-nowrap uppercase">
        {plan} ↗
      </Badge>
    </Button>
  </Hint>
);

interface SettingsRuleProps extends React.PropsWithChildren {
  title: string;
  description: React.ReactNode;
  titleProps?: string;
  plan?: string;
}
const SettingsRule: React.FC<SettingsRuleProps> = ({
  children,
  title,
  description,
  titleProps,
  plan,
}) => {
  return (
    <div className="flex cursor-default items-center justify-between">
      <div className="mr-[10%] flex w-full flex-col">
        <div className="flex items-center">
          <h3 className={cn("mb-0.5 flex p-0 text-sm font-normal", titleProps)}>
            {title}
          </h3>
          {!!plan && <SettingsPlan plan={plan} />}
        </div>
        <p className="w-4/5 text-xs text-secondary">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
};

export { SettingsSection, SettingsRule, SettingsPlan };
