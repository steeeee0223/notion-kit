"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Input, useMenu } from "@notion-kit/shadcn";

import { useTriggerPosition } from "./use-trigger-position";

type UseTextInputPopoverProps = TextInputPopoverProps;

export function useTextInputPopover<T extends HTMLElement = HTMLElement>({
  value,
  onUpdate,
}: UseTextInputPopoverProps) {
  const { openMenu, closeMenu } = useMenu();
  const { ref, position, width } = useTriggerPosition<T>();

  const openTextInput = useCallback(() => {
    openMenu(
      <TextInputPopover
        value={value}
        onUpdate={(v) => {
          onUpdate?.(v);
          closeMenu();
        }}
      />,
      {
        x: position.left,
        y: position.top,
        className:
          "max-h-[773px] min-h-[34px] w-60 overflow-visible backdrop-filter-none",
      },
    );
  }, [openMenu, value, position, onUpdate, closeMenu]);

  return { ref, width, openTextInput };
}

interface TextInputPopoverProps {
  value: string;
  onUpdate?: (value: string) => void;
}

function TextInputPopover({
  value: initialValue,
  onUpdate,
}: TextInputPopoverProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Input
      spellCheck
      variant="flat"
      value={value}
      onChange={(e) => {
        e.preventDefault();
        setValue(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onUpdate?.(value);
      }}
      onBlur={() => onUpdate?.(value)}
      className="max-h-[771px] min-h-8 border-none bg-transparent word-break whitespace-pre-wrap caret-primary"
    />
  );
}
