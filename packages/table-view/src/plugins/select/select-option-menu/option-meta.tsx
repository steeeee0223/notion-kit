"use client";

import { useEffect, useState } from "react";

import { cn } from "@notion-kit/cn";
import { useInputField } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { Button, Input, TooltipPreset, typography } from "@notion-kit/shadcn";

import type { OptionConfig } from "../types";

interface OptionMetaProps {
  option: OptionConfig;
  validateName: (name: string) => boolean;
  onUpdate: (data: { name?: string; description?: string }) => void;
}

export function OptionMeta({
  option,
  validateName,
  onUpdate,
}: OptionMetaProps) {
  const [showDesc, setShowDesc] = useState(false);
  const toggleDesc = () => setShowDesc((v) => !v);

  const nameField = useInputField({
    id: "name",
    initialValue: option.name,
    validate: validateName,
    onUpdate: (name) => onUpdate({ name }),
  });
  const descField = useInputField({
    id: "description",
    initialValue: option.description ?? "",
    onUpdate: (description) => onUpdate({ description }),
  });

  useEffect(() => {
    if (showDesc) descField.ref.current?.focus();
  }, [descField.ref, showDesc]);

  return (
    <>
      <div className="flex flex-col gap-px px-3 pt-3 pb-1">
        <div className="flex min-h-7 w-full items-center select-none">
          <Input
            {...nameField.props}
            endIcon={
              <TooltipPreset
                side="top"
                description="Add property description"
                className="z-999"
              >
                <Button
                  tabIndex={0}
                  variant="close"
                  className="ml-1 grow-0"
                  onClick={toggleDesc}
                  aria-label="Add property description"
                >
                  <Icon.InfoFilled className="fill-default/45 hover:fill-icon" />
                </Button>
              </TooltipPreset>
            }
          />
        </div>
        {nameField.error && (
          <div className="pt-2 text-sm text-red">Option already exists.</div>
        )}
      </div>
      {showDesc && (
        <div className="flex min-h-7 w-full min-w-0 flex-auto items-center px-3 py-1 leading-tight select-none">
          <Input
            className={cn(typography("body"))}
            placeholder="Add a description..."
            {...descField.props}
          />
        </div>
      )}
    </>
  );
}
