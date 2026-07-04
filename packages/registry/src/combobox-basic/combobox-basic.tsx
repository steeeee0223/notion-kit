"use client";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@notion-kit/ui/primitives";

const OPTIONS = [
  {
    value: "Frameworks",
    items: ["React", "Vue", "Svelte", "Angular", "Solid"],
  },
  {
    value: "Packages",
    items: [
      "Zustand",
      "Tanstack Query",
      "React Router",
      "React Hook Form",
      "React Query",
    ],
  },
];

export default function ComboboxBasic() {
  return (
    <Combobox items={OPTIONS}>
      <ComboboxInput placeholder="Select a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(group: (typeof OPTIONS)[number]) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(item: string) => <ComboboxItem key={item} value={item} />}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
