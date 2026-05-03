import { useState } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";

import { AlertModal } from "@notion-kit/ui/common";
import { Trans, useTranslation } from "@notion-kit/ui/i18n";
import { Icon } from "@notion-kit/ui/icons";
import {
  Button,
  Dialog,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";
import { toDateString } from "@notion-kit/utils";

import type { EmojiRow } from "@/lib/types";
import { EmojiForm } from "@/presets/modals";

import { SortingToggle, TextCell } from "../common-cells";

function emojiFilterFn(
  row: Row<EmojiRow>,
  _columnId: string,
  filterValue: unknown,
) {
  const { name, createdBy } = row.original;
  return `${name}-${createdBy}`
    .toLowerCase()
    .includes(String(filterValue).trim());
}

interface CreateEmojiColumnsOptions {
  onEdit?: (emoji: EmojiRow, data: { name: string; file?: File }) => void;
  onDelete?: (emoji: EmojiRow) => void;
}

export function createEmojiColumns({
  onEdit,
  onDelete,
}: CreateEmojiColumnsOptions): ColumnDef<EmojiRow>[] {
  return [
    {
      id: "image",
      header: () => (
        <TextCell value={<Trans i18nKey="tables.emojis.columns.image" />} />
      ),
      cell: ({ row }) => (
        <img
          loading="lazy"
          alt={row.original.name}
          src={row.original.src}
          className="size-6 object-contain"
        />
      ),
    },
    {
      id: "name",
      accessorKey: "name",
      header: () => (
        <TextCell value={<Trans i18nKey="tables.emojis.columns.name" />} />
      ),
      cell: ({ row }) => <TextCell value={row.original.name} />,
      filterFn: emojiFilterFn,
    },
    {
      id: "createdBy",
      accessorKey: "createdBy",
      header: () => (
        <TextCell value={<Trans i18nKey="tables.emojis.columns.added-by" />} />
      ),
      cell: ({ row }) => <TextCell value={row.original.createdBy} />,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortingToggle
          title={<Trans i18nKey="tables.emojis.columns.date-added" />}
          isSorted={column.getIsSorted()}
          toggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <TextCell value={toDateString(row.original.createdAt)} />
      ),
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <ActionCell emoji={row.original} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ];
}

interface ActionCellProps {
  emoji: EmojiRow;
  onEdit?: (emoji: EmojiRow, data: { name: string; file?: File }) => void;
  onDelete?: (emoji: EmojiRow) => void;
}

function ActionCell({ emoji, onEdit, onDelete }: ActionCellProps) {
  const { t } = useTranslation("settings");
  const trans = t("tables.emojis", { returnObjects: true });
  const [editOpen, setEditOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="hint" className="size-5" aria-label="More options">
          <Icon.Dots className="size-4 fill-current" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-50">
        <DropdownMenuGroup>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                Icon={<Icon.PencilLine />}
                Body={trans.actions.edit}
                onSelect={(e) => e.preventDefault()}
              />
            </DialogTrigger>
            <EmojiForm
              emoji={emoji}
              onSave={async (data) => {
                await Promise.resolve(onEdit?.(emoji, data));
                setEditOpen(false);
              }}
            />
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem
                variant="error"
                Icon={<Icon.Trash />}
                Body={trans.actions.delete}
                onSelect={(e) => e.preventDefault()}
              />
            </DialogTrigger>
            <AlertModal {...trans.delete} onTrigger={() => onDelete?.(emoji)} />
          </Dialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
