import React from "react";
import { HelpCircle } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { Badge, Button, Separator, TooltipPreset } from "@notion-kit/shadcn";

interface SettingsSectionProps extends React.PropsWithChildren {
  title: string;
  className?: string;
  hideSeparator?: boolean;
}
function SettingsSection({
  title,
  className,
  hideSeparator = false,
  children,
}: SettingsSectionProps) {
  return (
    <div className="p-0">
      <h3 className="pb-3 text-base font-medium">{title}</h3>
      {!hideSeparator && <Separator className="mb-4" />}
      <div className={cn("space-y-[18px]", className)}>{children}</div>
    </div>
  );
}

interface SettingsPlanProps {
  plan: string;
  onClick?: () => void;
}
function SettingsPlan({ plan, onClick }: SettingsPlanProps) {
  return (
    <TooltipPreset
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
    </TooltipPreset>
  );
}

interface SettingsRuleProps extends React.PropsWithChildren {
  title: string;
  description: React.ReactNode;
  className?: string;
  plan?: string;
  href?: string;
}
function SettingsRule({
  children,
  title,
  description,
  className,
  plan,
  href,
}: SettingsRuleProps) {
  return (
    <div
      data-slot="settings-rule"
      className={cn(
        "flex cursor-default items-center justify-between",
        className,
      )}
    >
      <div className="mr-[10%] flex w-full flex-col">
        <div className="flex items-center gap-0.5">
          <h3
            data-slot="settings-rule-title"
            className="mb-0.5 flex p-0 text-sm font-normal"
          >
            {title}
          </h3>
          {!!plan && <SettingsPlan plan={plan} />}
          {!!href && (
            <Button
              variant="hint"
              size="circle"
              className="size-4"
              onClick={() => window.open(href)}
            >
              <HelpCircle className="size-4" />
            </Button>
          )}
        </div>
        <p className="w-4/5 text-xs text-secondary">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

export { SettingsSection, SettingsRule, SettingsPlan };
