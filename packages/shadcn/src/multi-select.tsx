"use client";

import * as React from "react";
import { useEffect } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { XIcon } from "lucide-react";

import { cn } from "@notion-kit/cn";

import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./command";
import * as Icon from "./icons";
import { contentVariants } from "./variants";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** color of the option badge */
  color?: string;
  /** group the options by providing key. */
  [key: string]: string | boolean | undefined;
}
type GroupOptions = Record<string, MultiSelectOption[]>;

function transToGroupOptions(options: MultiSelectOption[], groupBy?: string) {
  if (!groupBy) return { "": options };

  const groupOption: GroupOptions = {};
  options.forEach((option) => {
    const key = (option[groupBy] as string) || "";
    groupOption[key] ??= [];
    groupOption[key].push(option);
  });
  return groupOption;
}

function removePickedOption(
  groupOptions: GroupOptions,
  picked: MultiSelectOption[],
) {
  const cloneOption = JSON.parse(JSON.stringify(groupOptions)) as GroupOptions;

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter(
      (val) => !picked.find((p) => p.value === val.value),
    );
  }
  return cloneOption;
}

function isOptionsExist(
  groupOptions: GroupOptions,
  targetOption: MultiSelectOption[],
) {
  for (const value of Object.values(groupOptions)) {
    if (
      value.some((option) => targetOption.find((p) => p.value === option.value))
    ) {
      return true;
    }
  }
  return false;
}

interface MultiSelectProps {
  value?: MultiSelectOption[];
  defaultOptions?: MultiSelectOption[];
  /** @prop Manually controlled options */
  options?: MultiSelectOption[];
  placeholder?: string;
  /** @prop Empty component. */
  emptyIndicator?: React.ReactNode;
  onChange?: (options: MultiSelectOption[]) => void;
  /** @prop Limit the maximum number of selected options. */
  maxSelected?: number;
  /** @prop When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void;
  /** @prop Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean;
  hideClearAllButton?: boolean;
  disabled?: boolean;
  /** @prop Group the options base on provided key. */
  groupBy?: string;
  /** @prop Styled class name of the root */
  className?: string;
  /** @prop Styled class names for each slot */
  classNames?: {
    badge?: string;
    input?: string;
    content?: string;
    group?: string;
    item?: string;
  };
  /**
   * @note First item selected is a default behavior by cmdk. That is why the default is true.
   * This is a workaround solution by adding a dummy item.
   * @reference https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean;
  /** @prop Allow user to create option when there is no option matched. */
  creatable?: boolean;
  /** @prop Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  /** @prop Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled" | "className"
  >;
  renderOption?: ({ option }: { option: MultiSelectOption }) => React.ReactNode;
}

function MultiSelect({
  value = [],
  onChange,
  placeholder,
  defaultOptions: arrayDefaultOptions = [],
  options: arrayOptions,
  emptyIndicator,
  maxSelected = Number.MAX_SAFE_INTEGER,
  onMaxSelected,
  hidePlaceholderWhenSelected,
  disabled,
  groupBy,
  className,
  classNames,
  selectFirstItem = true,
  creatable = false,
  commandProps,
  inputProps,
  hideClearAllButton = false,
  renderOption,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const [open, setOpen] = React.useState(false);
  const [onScrollbar, setOnScrollbar] = React.useState(false);

  const [inputValue, setInputValue] = React.useState("");
  const [selected, setSelected] = React.useState(value);
  const [groupOptions, setGroupOptions] = React.useState(
    transToGroupOptions(arrayDefaultOptions, groupBy),
  );

  /* outside click to close */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        inputRef.current.blur();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchend", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [open]);

  /* controlled value */
  useEffect(() => setSelected(value), [value]);
  /* controlled options */
  useEffect(() => {
    if (!arrayOptions) return;
    const newOption = transToGroupOptions(arrayOptions, groupBy);
    if (JSON.stringify(newOption) === JSON.stringify(groupOptions)) return;
    setGroupOptions(newOption);
  }, [arrayDefaultOptions, arrayOptions, groupBy, groupOptions]);

  /** handlers */
  const handleSelect = (option: MultiSelectOption) => {
    if (selected.length >= maxSelected) {
      onMaxSelected?.(selected.length);
      return;
    }
    setInputValue("");
    const newOptions = [...selected, option];
    setSelected(newOptions);
    onChange?.(newOptions);
  };

  const handleUnselect = (option: MultiSelectOption) => {
    const newOptions = selected.filter((s) => s.value !== option.value);
    setSelected(newOptions);
    onChange?.(newOptions);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (!input) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      if (input.value === "" && selected.length > 0) {
        const last = selected.at(-1)!;
        // If last item is fixed, we should not remove it.
        if (!last.fixed) {
          handleUnselect(last);
        }
      }
    }
    // This is not a default behavior of the <input /> field
    if (e.key === "Escape") input.blur();
  };

  const showCreatable =
    creatable &&
    inputValue.length > 0 &&
    !isOptionsExist(groupOptions, [{ value: inputValue, label: inputValue }]) &&
    !selected.find((s) => s.value === inputValue);

  const selectables = React.useMemo(
    () => removePickedOption(groupOptions, selected),
    [groupOptions, selected],
  );

  /** Avoid Creatable Selector freezing or lagging when paste a long string. */
  const commandFilter = React.useCallback(() => {
    if (commandProps?.filter) return commandProps.filter;

    if (creatable) {
      return (value: string, search: string) =>
        value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
    }
    // Using default filter in `cmdk`. We don't have to provide it.
    return undefined;
  }, [creatable, commandProps?.filter]);

  return (
    <Command
      ref={dropdownRef}
      {...commandProps}
      onKeyDown={(e) => {
        handleKeyDown(e);
        commandProps?.onKeyDown?.(e);
      }}
      className={cn("overflow-visible bg-transparent", commandProps?.className)}
      filter={commandFilter()}
    >
      <div
        role="button"
        tabIndex={-1}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onKeyDown={() => {}}
        className={cn(
          "relative min-h-[34px] rounded-md border border-border bg-input text-sm transition-[color,box-shadow] outline-none focus-within:shadow-notion",
          selected.length > 0 && "cursor-text py-1 pl-2",
          !disabled && "cursor-text",
          !hideClearAllButton && "pe-9",
          className,
        )}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.focus();
        }}
      >
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => (
            <Badge
              key={option.value}
              role="listitem"
              aria-label={option.value}
              variant="tag"
              size="md"
              className="my-0.5 h-5 max-w-full min-w-0 shrink-0 rounded pr-0 text-sm/[1.2]"
              style={{ backgroundColor: option.color }}
            >
              <span className="truncate">{option.label}</span>
              <Button
                variant="hint"
                className="size-5 shrink-0 hover:text-icon"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(option);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleUnselect(option)}
                aria-label="Remove"
              >
                <XIcon className="size-3.5" />
              </Button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            className={cn(
              "flex-1 bg-transparent outline-hidden placeholder:text-default/45 disabled:cursor-not-allowed",
              selected.length > 0 ? "ml-1" : "px-3 py-2",
              hidePlaceholderWhenSelected && "w-full",
              classNames?.input,
            )}
            {...inputProps}
            ref={inputRef}
            value={inputValue}
            disabled={disabled}
            onValueChange={(value) => {
              setInputValue(value);
              inputProps?.onValueChange?.(value);
            }}
            onBlur={(event) => {
              if (!onScrollbar) {
                setOpen(false);
              }
              inputProps?.onBlur?.(event);
            }}
            onFocus={(event) => {
              setOpen(true);
              inputProps?.onFocus?.(event);
            }}
            placeholder={
              hidePlaceholderWhenSelected && selected.length !== 0
                ? ""
                : placeholder
            }
          />
          <div className="absolute end-2 flex size-6 items-center justify-center">
            <Button
              type="button"
              tabIndex={-1}
              variant="close"
              size="circle"
              className={cn(
                (hideClearAllButton ||
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  disabled ||
                  selected.length < 1 ||
                  selected.filter((s) => s.fixed).length === selected.length) &&
                  "hidden",
              )}
              aria-label="Clear all"
              onClick={() => {
                setSelected(selected.filter((s) => s.fixed));
                onChange?.(selected.filter((s) => s.fixed));
              }}
            >
              <Icon.Clear />
            </Button>
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          className={cn(
            contentVariants({ variant: "default", openAnimation: true }),
            "absolute top-2 z-10 w-full overflow-hidden rounded-md bg-modal",
            !open && "hidden",
            classNames?.content,
          )}
          data-state={open ? "open" : "closed"}
        >
          {open && (
            <CommandList
              onMouseLeave={() => setOnScrollbar(false)}
              onMouseEnter={() => setOnScrollbar(true)}
              onMouseUp={() => inputRef.current?.focus()}
            >
              {/* Empty indicator */}
              {emptyIndicator && (
                <CommandEmpty className="py-2">{emptyIndicator}</CommandEmpty>
              )}
              {/* First-item selection workaround */}
              {!selectFirstItem && <CommandItem value="-" className="hidden" />}
              {/* Options */}
              {Object.entries(selectables).map(([group, options]) => (
                <CommandGroup
                  key={group}
                  heading={group}
                  className={cn("h-full overflow-auto", classNames?.group)}
                >
                  <>
                    {options.map((option) => (
                      <CommandItem
                        className={classNames?.item}
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={() => handleSelect(option)}
                      >
                        {renderOption ? renderOption({ option }) : option.label}
                      </CommandItem>
                    ))}
                  </>
                </CommandGroup>
              ))}
              {/* Creatable */}
              {showCreatable && (
                <CommandGroup
                  className={cn("h-full overflow-auto", classNames?.group)}
                >
                  <CommandItem
                    className={classNames?.item}
                    value={inputValue}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={(value: string) => {
                      if (selected.length >= maxSelected) {
                        onMaxSelected?.(selected.length);
                        return;
                      }
                      setInputValue("");
                      const newOptions = [...selected, { value, label: value }];
                      setSelected(newOptions);
                      onChange?.(newOptions);
                    }}
                  >
                    {`Create "${inputValue}"`}
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          )}
        </div>
      </div>
    </Command>
  );
}

export { MultiSelect };
