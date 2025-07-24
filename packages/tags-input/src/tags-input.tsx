"use client";

/**
 * @see https://github.com/shadcn-ui/ui/issues/3647
 */
import { useCallback, useEffect } from "react";
import { XIcon } from "lucide-react";
import { z } from "zod";

import { cn } from "@notion-kit/cn";
import type { InputProps } from "@notion-kit/shadcn";
import { Badge, Button } from "@notion-kit/shadcn";
import { COLOR, type Color } from "@notion-kit/utils";

export interface TagOption {
  value: string;
  color?: Color;
}

type TagsInputProps = Omit<InputProps, "value" | "onChange" | "variant"> & {
  value: { tags: (string | TagOption)[]; input: string };
  inputSchema?: z.Schema;
  onTagsChange?: (value: string[]) => void;
  onInputChange?: (value: string) => void;
};

function TagsInput({
  ref,
  className,
  value,
  inputSchema,
  onTagsChange,
  onInputChange,
  ...props
}: TagsInputProps) {
  const tags = toTagOptions(value.tags);

  const onUpdate = useCallback(
    (tags: string[], input?: string) => {
      onTagsChange?.(tags);
      onInputChange?.(input ?? "");
    },
    [onInputChange, onTagsChange],
  );
  const onAddTag = () => {
    if (!value.input) return;
    const result = inputSchema?.safeParse(value.input) ?? { success: true };
    if (result.success) {
      const tags = new Set(value.tags.map((tag) => getValue(tag)));
      tags.add(value.input);
      onUpdate(Array.from(tags), "");
    }
  };
  const onDeleteTag = (item: string) =>
    onUpdate(
      value.tags.reduce<string[]>((acc, tag) => {
        const value = getValue(tag);
        if (value !== item) acc.push(value);
        return acc;
      }, []),
    );
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
      onUpdate(value.tags.slice(0, -1).map((tag) => getValue(tag)));
    }
  };

  useEffect(() => {
    if (value.input.includes(",")) {
      const tags = new Set(value.tags.map((tag) => getValue(tag)));
      value.input.split(",").forEach((chunk) => tags.add(chunk.trim()));
      onUpdate(Array.from(tags), "");
    }
  }, [value, onUpdate]);

  return (
    <div
      className={cn(
        "flex min-h-10 w-full flex-wrap gap-2 rounded-sm border border-border bg-default/5 px-3 py-2 text-sm",
        "placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none",
        className,
      )}
    >
      {tags.map((tag) => (
        <Badge
          key={tag.value}
          role="listitem"
          aria-label={tag.value}
          variant="tag"
          size="sm"
          className="h-5 max-w-full min-w-0 shrink-0 rounded pr-0 text-sm/[1.2]"
          style={{
            backgroundColor: tag.color ? COLOR[tag.color].rgba : undefined,
          }}
        >
          <span className="truncate">{tag.value}</span>
          <Button
            variant="hint"
            className="size-5 shrink-0 hover:bg-transparent hover:text-icon"
            tabIndex={0}
            onClick={() => onDeleteTag(getValue(tag))}
          >
            <XIcon className="size-2 shrink-0 flex-grow-0" />
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
}

function getValue(tag: string | TagOption): string {
  return typeof tag === "string" ? tag : tag.value;
}

function toTagOptions(
  tags: (string | [string, Color | undefined] | TagOption)[],
): TagOption[] {
  return tags.map((tag) =>
    typeof tag === "string"
      ? { value: tag }
      : Array.isArray(tag)
        ? { value: tag[0], color: tag[1] }
        : tag,
  );
}

export { TagsInput };
