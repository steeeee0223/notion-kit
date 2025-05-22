"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Input, useMenu } from "@notion-kit/shadcn";

type UseTextInputPopoverProps = TextInputPopoverProps;

export function useTextInputPopover<T extends HTMLElement = HTMLElement>({
  value,
  onUpdate,
}: UseTextInputPopoverProps) {
  const ref = useRef<T>(null);
  const { openMenu, closeMenu } = useMenu();

  const [width, setWidth] = useState(0);

  const openTextInput = useCallback(() => {
    const rect = ref.current?.getBoundingClientRect();

    openMenu(
      <TextInputPopover
        value={value}
        onUpdate={(v) => {
          onUpdate?.(v);
          closeMenu();
        }}
      />,
      {
        x: rect?.x,
        y: rect?.y,
        className:
          "max-h-[773px] min-h-[34px] w-60 overflow-visible backdrop-filter-none",
      },
    );
  }, [openMenu, value, onUpdate, closeMenu]);

  useLayoutEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setWidth(rect.width);
  }, []);

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
      className="max-h-[771px] min-h-8 border-none bg-transparent word-break whitespace-pre-wrap caret-primary"
    />
  );
}
