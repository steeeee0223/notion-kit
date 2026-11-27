import { useMemo } from "react";

import {
  referenceLabel,
  type PropertyReference,
} from "@notion-kit/table-hook/plugins";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
} from "@notion-kit/ui/primitives";

export function ReferenceAvatar({
  reference,
}: {
  reference: PropertyReference;
}) {
  return (
    <Avatar className="size-5">
      {reference.avatarUrl && <AvatarImage src={reference.avatarUrl} alt="" />}
      <AvatarFallback>
        {referenceLabel(reference).slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export function ReferencePicker({
  value,
  options,
  label,
  onChange,
  single,
  avatars,
  heading,
}: {
  value: PropertyReference[];
  options: readonly PropertyReference[];
  label: string;
  onChange: (value: PropertyReference[]) => void;
  single?: boolean;
  avatars?: boolean;
  heading?: string;
}) {
  const choices = useMemo(
    () => new Map([...value, ...options].map((option) => [option.id, option])),
    [value, options],
  );
  const items = useMemo(
    () =>
      Combobox.createItems([...choices.values()], {
        getValue: ({ id }) => id,
        getLabel: referenceLabel,
      }),
    [choices],
  );
  return (
    <Combobox
      inline
      open
      multiple
      items={items}
      value={value.map(({ id }) => id)}
      onValueChange={(ids) =>
        onChange(
          (single ? ids.slice(-1) : ids).flatMap((id) => {
            const item = choices.get(id);
            return item ? [item] : [];
          }),
        )
      }
    >
      <ComboboxChips variant="inline" hideClearButton={avatars}>
        <ComboboxValue>
          {(selected: string[]) => (
            <>
              {selected.map((id) => {
                const reference = choices.get(id);
                return (
                  <ComboboxChip key={id}>
                    <span className="flex items-center gap-1">
                      {avatars && reference && (
                        <ReferenceAvatar reference={reference} />
                      )}
                      <span className="truncate">
                        {reference ? referenceLabel(reference) : id}
                      </span>
                    </span>
                  </ComboboxChip>
                );
              })}
              <ComboboxChipsInput aria-label={label} placeholder={label} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent variant="inline">
        <ComboboxEmpty>No matches.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxGroup>
            {heading && <ComboboxLabel title={heading} />}
            <ComboboxCollection>
              {(item: PropertyReference) => (
                <ComboboxItem
                  key={item.id}
                  value={item.id}
                  label={referenceLabel(item)}
                  icon={
                    avatars ? <ReferenceAvatar reference={item} /> : undefined
                  }
                />
              )}
            </ComboboxCollection>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
