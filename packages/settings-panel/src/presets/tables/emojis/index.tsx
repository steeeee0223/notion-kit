import { useMemo, useRef, useState } from "react";

import { cn } from "@notion-kit/cn";
import { useTranslation } from "@notion-kit/ui/i18n";
import { Icon } from "@notion-kit/ui/icons";
import {
  Button,
  Dialog,
  DialogTrigger,
  Input,
} from "@notion-kit/ui/primitives";

import type { EmojiRow } from "@/lib/types";
import { EmojiForm, type EmojiSchema } from "@/presets/modals";

import { DataTable } from "../data-table";
import { createEmojiColumns } from "./columns";

interface EmojisTableProps {
  data: EmojiRow[];
  onCreate?: (data: EmojiSchema) => Promise<void>;
  onEdit?: (emoji: EmojiRow, data: EmojiSchema) => void;
  onDelete?: (emoji: EmojiRow) => void;
}

export function EmojisTable({
  data,
  onCreate,
  onEdit,
  onDelete,
}: EmojisTableProps) {
  const { t } = useTranslation("settings");
  const trans = t("tables.emojis", { returnObjects: true });

  const columns = useMemo(
    () => createEmojiColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleSearch = () => {
    setSearchOpen((v) => !v);
    inputRef.current?.focus();
  };

  return data.length > 0 ? (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-secondary">
          {t("tables.emojis.count", { count: data.length })}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Button
              variant="hint"
              className="size-7"
              aria-label={trans.search}
              onClick={toggleSearch}
            >
              <Icon.CollectionSearch className="fill-icon" />
            </Button>
            <Input
              ref={inputRef}
              clear
              variant="flat"
              className={cn(
                "transition-[width,opacity] duration-200 ease-in-out",
                searchOpen ? "w-[150px] opacity-100" : "w-0 p-0 opacity-0",
              )}
              placeholder={trans.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onCancel={() => setSearch("")}
            />
          </div>
          <AddEmojiDialog onCreate={onCreate}>
            <Button variant="blue" size="sm" className="h-7">
              {trans["add-emoji"]}
            </Button>
          </AddEmojiDialog>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        search={{ id: "name", value: search }}
        emptyResult="No emojis"
        getHeaderClassName={(headerId) =>
          cn(
            headerId === "image" && "w-[10%]",
            headerId === "name" && "w-[40%]",
            headerId === "createdBy" && "w-1/4",
            headerId === "createdAt" && "w-[20%]",
            headerId === "actions" && "w-[5%]",
          )
        }
      />
    </div>
  ) : (
    <div className="mt-25 flex flex-col items-center justify-center gap-3">
      <Icon.EmojiFace className="size-16 fill-icon" />
      <span className="max-w-50 text-center text-xs text-secondary">
        {trans.empty}
      </span>
      <AddEmojiDialog onCreate={onCreate}>
        <Button size="sm">{trans["add-emoji"]}</Button>
      </AddEmojiDialog>
    </div>
  );
}

interface AddEmojiDialogProps extends React.PropsWithChildren {
  onCreate?: (data: EmojiSchema) => Promise<void>;
}

function AddEmojiDialog({ children, onCreate }: AddEmojiDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <EmojiForm
        onSave={async ({ name, file }) => {
          if (file) await onCreate?.({ name, file });
          setOpen(false);
        }}
      />
    </Dialog>
  );
}
