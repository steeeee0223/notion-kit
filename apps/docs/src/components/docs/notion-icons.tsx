import { useRef, useState, type RefObject } from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

import { useCopyToClipboard, useRect } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteRow,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useAutocompleteFilteredItems,
} from "@notion-kit/ui/primitives";

const icons = Object.entries(Icon)
  .sort(([first], [second]) => first.localeCompare(second, "en"))
  .map(([name, Component]) => ({ name, Component }));
type NotionIcon = (typeof icons)[number];

function IconGridItem({
  item,
  highlighted,
  disabled,
  onSelect,
}: {
  item: NotionIcon;
  highlighted: boolean;
  disabled: boolean;
  onSelect: (item: NotionIcon) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    // Keyboard grid navigation keeps DOM focus on the search input.
    <Tooltip open={!disabled && (highlighted || open)} onOpenChange={setOpen}>
      <TooltipTrigger
        render={
          <AutocompleteItem
            nativeButton
            value={item}
            aria-label={item.name}
            onClick={() => onSelect(item)}
            render={
              <Button
                variant="hint"
                className="size-12 rounded-lg bg-input fill-current text-primary data-highlighted:bg-default/10 data-highlighted:ring-2 data-highlighted:ring-blue [&_svg]:size-6!"
              >
                <item.Component />
              </Button>
            }
          />
        }
      />
      <TooltipContent side="top">{item.name}</TooltipContent>
    </Tooltip>
  );
}

function IconGrid({
  highlighted,
  disabled,
  columns,
  onSelect,
}: {
  highlighted: string | undefined;
  disabled: boolean;
  columns: number;
  onSelect: (item: NotionIcon) => void;
}) {
  const items = useAutocompleteFilteredItems<NotionIcon>();
  const rows: NotionIcon[][] = [];
  for (let index = 0; index < items.length; index += columns) {
    rows.push(items.slice(index, index + columns));
  }

  return (
    <AutocompleteList className="max-h-none overflow-visible">
      <AutocompleteGroup className="flex flex-col gap-3 overflow-visible p-0">
        {rows.map((row, index) => (
          <AutocompleteRow
            key={index}
            className="grid gap-3 p-0"
            style={{
              gridTemplateColumns: `repeat(${columns}, 48px)`,
            }}
          >
            {row.map((item) => (
              <IconGridItem
                key={item.name}
                item={item}
                highlighted={highlighted === item.name}
                disabled={disabled}
                onSelect={onSelect}
              />
            ))}
          </AutocompleteRow>
        ))}
      </AutocompleteGroup>
    </AutocompleteList>
  );
}

function IconDialog({
  item,
  onClose,
  searchRef,
}: {
  item: NotionIcon;
  onClose: () => void;
  searchRef: RefObject<HTMLInputElement | null>;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [copyError, setCopyError] = useState(false);
  const { copiedText, copy } = useCopyToClipboard({
    onSuccess: () => setCopyError(false),
    onError: () => setCopyError(true),
  });

  function copySvg() {
    const svg = previewRef.current?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true);
    if (!(clone instanceof SVGSVGElement)) return;
    const style = getComputedStyle(svg);
    clone.removeAttribute("class");
    clone.removeAttribute("aria-hidden");
    clone.removeAttribute("role");
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "24");
    clone.setAttribute("height", "24");
    clone.setAttribute(
      "fill",
      style.fill === style.color ? "currentColor" : style.fill,
    );
    // Preserve directional icons whose rotation is supplied by Tailwind classes.
    if (style.rotate !== "none") {
      clone.style.rotate = style.rotate;
      clone.style.transformOrigin = "center";
    }
    if (style.transform !== "none") {
      clone.style.transform = style.transform;
      clone.style.transformOrigin = "center";
    }
    void copy(new XMLSerializer().serializeToString(clone));
  }

  return (
    <Dialog
      defaultOpen
      onOpenChangeComplete={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto p-6 sm:p-8 md:max-w-3xl"
        aria-describedby={undefined}
        finalFocus={searchRef}
      >
        <div className="grid min-w-0 gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] sm:items-center">
          <div
            ref={previewRef}
            className="flex aspect-square items-center justify-center rounded-xl bg-input fill-current p-10 text-primary [&_svg]:size-full!"
          >
            <item.Component />
          </div>
          <div className="flex min-w-0 flex-col items-start gap-4">
            <DialogTitle className="w-full pr-5 text-left text-2xl">
              {item.name}
            </DialogTitle>
            <Button size="md" onClick={copySvg}>
              Copy SVG
            </Button>
            <p role="status" className="min-h-5 text-sm text-secondary">
              {copyError
                ? "Unable to copy SVG. Please try again."
                : copiedText
                  ? "SVG copied to clipboard."
                  : ""}
            </p>
            <div className="w-full min-w-0">
              <DynamicCodeBlock
                lang="tsx"
                code={`import { Icon } from "@notion-kit/icons";\n\n<Icon.${item.name} />`}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NotionIcons() {
  const [selected, setSelected] = useState<NotionIcon | null>(null);
  const [highlighted, setHighlighted] = useState<string>();
  const searchRef = useRef<HTMLInputElement>(null);
  const { ref, rect } = useRect<HTMLDivElement>();
  const columns = rect.width
    ? Math.max(1, Math.floor((rect.width + 12) / 60))
    : 4;

  return (
    // eslint-disable-next-line better-tailwindcss/no-unknown-classes -- Fumadocs typography utility.
    <div className="not-prose text-primary">
      <Autocomplete
        items={icons}
        itemToStringValue={(item) => item.name}
        inline
        open
        grid
        onItemHighlighted={(item) => setHighlighted(item?.name)}
      >
        <div ref={ref}>
          <AutocompleteInput
            ref={searchRef}
            aria-label="Search Notion icons"
            placeholder={`Search ${icons.length} icons...`}
            className="h-14 text-lg [&_input]:w-full"
          />
        </div>
        <AutocompleteContent variant="inline" className="mt-6">
          <AutocompleteEmpty>No icons found.</AutocompleteEmpty>
          <IconGrid
            highlighted={highlighted}
            disabled={selected !== null}
            columns={columns}
            onSelect={setSelected}
          />
        </AutocompleteContent>
      </Autocomplete>
      {selected && (
        <IconDialog
          key={selected.name}
          item={selected}
          onClose={() => setSelected(null)}
          searchRef={searchRef}
        />
      )}
    </div>
  );
}
