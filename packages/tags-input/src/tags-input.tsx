"use client";

/**
 * @see https://github.com/shadcn-ui/ui/issues/3647
 */
import React, { useCallback, useEffect } from "react";
import { XIcon } from "lucide-react";
import { z } from "zod";

import { cn } from "@notion-kit/cn";
import type { InputProps } from "@notion-kit/shadcn";
import { Badge, Button } from "@notion-kit/shadcn";

type TagsInputProps = Omit<InputProps, "value" | "onChange" | "variant"> & {
  value: { tags: string[]; input: string };
  inputSchema?: z.Schema;
  onTagsChange?: (value: string[]) => void;
  onInputChange?: (value: string) => void;
};

const TagsInput: React.FC<TagsInputProps> = ({
  ref,
  className,
  value,
  inputSchema,
  onTagsChange,
  onInputChange,
  ...props
}) => {
  const onUpdate = useCallback(
    (tags: string[], input?: string) => {
      onTagsChange?.(tags);
      onInputChange?.(input ?? "");
    },
    [onInputChange, onTagsChange],
  );
  const onAddTag = () => {
    const result = inputSchema?.safeParse(value.input) ?? { success: true };
    if (result.success) {
      const tags = Array.from(new Set([...value.tags, value.input]));
      onUpdate(tags, "");
    }
  };
  const onDeleteTag = (item: string) =>
    onUpdate(value.tags.filter((i) => i !== item));
  const onKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onAddTag();
    } else if (
      e.key === "Backspace" &&
      value.input.length === 0 &&
      value.tags.length > 0
    ) {
      e.preventDefault();
      onUpdate(value.tags.slice(0, -1));
    }
  };

  useEffect(() => {
    if (value.input.includes(",")) {
      const newDataPoints = new Set([
        ...value.tags,
        ...value.input.split(",").map((chunk) => chunk.trim()),
      ]);
      onUpdate(Array.from(newDataPoints), "");
    }
  }, [value, onUpdate]);

  return (
    <div
      className={cn(
        // caveat: :has() variant requires tailwind v3.4 or above: https://tailwindcss.com/blog/tailwindcss-v3-4#new-has-variant
        "flex min-h-10 w-full flex-wrap gap-2 rounded-sm border border-border bg-primary/5 px-3 py-2 text-sm",
        "placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
        "has-[:focus-visible]:outline-none",
        className,
      )}
    >
      {value.tags.map((item) => (
        <Badge
          key={item}
          role="listitem"
          aria-label={item}
          variant="tag"
          size="sm"
          className="h-5 max-w-full min-w-0 flex-shrink-0 rounded pr-0 text-sm leading-[120%]"
        >
          <span className="truncate">{item}</span>
          <Button
            variant="hint"
            className="size-5 flex-shrink-0 hover:bg-transparent hover:text-icon"
            tabIndex={0}
            onClick={() => onDeleteTag(item)}
          >
            <XIcon className="size-2 flex-shrink-0 flex-grow-0" />
          </Button>
        </Badge>
      ))}
      <div className="ml-0.5 flex w-auto min-w-[60px] flex-[1_1_100%] items-center">
        <input
          className="block h-[18px] w-full resize-none border-none bg-transparent leading-5 text-inherit outline-none"
          value={value.input}
          onChange={(e) => onInputChange?.(e.target.value)}
          onKeyDown={onKeydown}
          {...props}
          ref={ref}
        />
      </div>
    </div>
  );
};

TagsInput.displayName = "TagsInput";

export { TagsInput };
