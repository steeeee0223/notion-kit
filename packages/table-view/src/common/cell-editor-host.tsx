import { useState } from "react";
import type { ReactElement } from "react";
import { flexRender, functionalUpdate } from "@tanstack/react-table";

import { useRect } from "@notion-kit/hooks";
import type {
  CellEditorProps,
  CellPlugin,
  CellValueProps,
} from "@notion-kit/table-hook/plugins";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/ui/primitives";

import { useCellSelectionEditor } from "./cell-selection";

interface CellEditorHostProps<Data, Config> {
  plugin: CellPlugin<string, Data, Config>;
  valueProps: CellValueProps<Data, Config>;
  editorProps: CellEditorProps<Data, Config>;
}

export function CellEditorHost<Data, Config>({
  plugin,
  valueProps,
  editorProps,
}: CellEditorHostProps<Data, Config>) {
  const [open, setOpen] = useState(false);
  const cellSelectionEditor = useCellSelectionEditor();
  const { ref, rect } = useRect<HTMLElement>();
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    cellSelectionEditor?.onEditorOpenChange(nextOpen);
  };
  const value = flexRender(plugin.renderCellValue, {
    ...valueProps,
    onClick: () => {
      if (
        !editorProps.disabled &&
        cellSelectionEditor?.canOpenEditor() !== false
      ) {
        handleOpenChange(true);
      }
    },
  });
  const result = plugin.renderCellEditor?.({
    ...editorProps,
    onChange: (updater) => {
      editorProps.onChange(functionalUpdate(updater, editorProps.data));
      if (result?.closeOnChange !== false) handleOpenChange(false);
    },
    onCancel: () => handleOpenChange(false),
  });

  if (!result) return value;
  if (result.presentation === "inline") return result.content;
  if (!value) return null;

  const { popover } = result;
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        ref={ref}
        nativeButton={false}
        render={value as ReactElement}
      />
      <PopoverContent
        align={popover?.align}
        alignOffset={popover?.alignOffset}
        side={popover?.side}
        sideOffset={
          typeof popover?.sideOffset === "function"
            ? popover.sideOffset(rect)
            : popover?.sideOffset
        }
        className={popover?.className}
      >
        {result.content}
      </PopoverContent>
    </Popover>
  );
}
