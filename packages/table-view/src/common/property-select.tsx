import { cn } from "@notion-kit/cn";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

import { useTableViewMessages } from "@/messages";
import { useTableViewCtx } from "@/table-contexts";

import { DefaultIcon } from "./default-icon";

interface PropertySelectProps {
  className?: string;
  value: string;
  onValueChange: (propertyId: string) => void;
}

export function PropertySelect({
  className,
  value,
  onValueChange,
}: PropertySelectProps) {
  const { table } = useTableViewCtx();
  const messages = useTableViewMessages();

  return (
    <table.Subscribe
      selector={(state) => ({
        columnsInfo: state.columnsInfo,
        cellPlugins: state.cellPlugins,
      })}
    >
      {() => {
        const properties = table.getFilterProperties();
        const currentProperty = properties.find(({ id }) => id === value);
        const items = [
          ...properties.map(({ id, name, type, icon }) => ({
            value: id,
            label: (
              <span className="flex items-center gap-2 truncate">
                {icon ? <IconBlock icon={icon} /> : <DefaultIcon type={type} />}
                {name}
              </span>
            ),
          })),
          ...(!currentProperty
            ? [{ value, label: messages.aria.unavailableProperty(value) }]
            : []),
        ];

        return (
          <Select
            items={items}
            value={value}
            onValueChange={(propertyId) => {
              if (propertyId !== null) onValueChange(propertyId);
            }}
          >
            <SelectTrigger
              aria-label={messages.aria.propertySelect}
              className={cn(
                "my-0 w-full max-w-45 border border-border",
                className,
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {!currentProperty && (
                  <SelectItem
                    value={value}
                    label={messages.aria.unavailableProperty(value)}
                    disabled
                  />
                )}
                {properties.map(({ id, name, type, icon }) => (
                  <SelectItem
                    key={id}
                    value={id}
                    label={name}
                    icon={
                      icon ? (
                        <IconBlock icon={icon} />
                      ) : (
                        <DefaultIcon type={type} />
                      )
                    }
                    disabled={id === value}
                  />
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        );
      }}
    </table.Subscribe>
  );
}
