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
    items: [
      { id: "react", name: "React" },
      { id: "vue", name: "Vue" },
      { id: "svelte", name: "Svelte" },
      { id: "angular", name: "Angular" },
      { id: "solid", name: "Solid" },
    ],
  },
  {
    value: "Packages",
    items: [
      { id: "zustand", name: "Zustand" },
      { id: "tanstack-query", name: "Tanstack Query" },
      { id: "react-router", name: "React Router" },
      { id: "react-hook-form", name: "React Hook Form" },
      { id: "react-query", name: "React Query" },
    ],
  },
];

type Option = (typeof OPTIONS)[number]["items"][number];

const items = Combobox.createItems(OPTIONS, {
  getValue: (item: Option) => item.id,
  getLabel: (item) => item.name,
});

export default function ComboboxBasic() {
  return (
    <Combobox items={items} defaultValue="react">
      <ComboboxInput
        aria-label="Framework or package"
        placeholder="Select a framework"
      />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(group: (typeof OPTIONS)[number]) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel title={group.value} />
              <ComboboxCollection>
                {(item: Option) => (
                  <ComboboxItem
                    key={item.id}
                    value={item.id}
                    label={item.name}
                  />
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
