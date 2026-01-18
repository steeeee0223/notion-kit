"use client";

import { useTransition } from "react";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Spinner,
} from "@notion-kit/shadcn";

interface DeleteMemberProps {
  onDelete?: () => void;
}

export function DeleteMember({ onDelete }: DeleteMemberProps) {
  const [loading, startTransition] = useTransition();

  const onRemove = () => startTransition(() => onDelete?.());

  return (
    <DialogContent className="flex w-[406px] flex-col items-start justify-center gap-6 p-5">
      <DialogHeader>
        <div className="flex items-center justify-center">
          <Icon.UserX className="size-9 shrink-0 fill-default/45 p-1" />
        </div>
        <DialogTitle className="px-6 text-lg/[22px]">
          Why are you removing this member from your workspace?
        </DialogTitle>
        <DialogDescription>
          We&apos;d love your input to make Notion better
        </DialogDescription>
      </DialogHeader>
      <Card className="w-full" asButton={false}>
        <CardContent className="flex w-full flex-col items-start gap-4 p-4">
          {options.map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox id={option} size="xs" className="border-[1.5px]" />
              <Label htmlFor={option}>{option} </Label>
            </div>
          ))}
        </CardContent>
      </Card>
      <DialogFooter>
        <Button
          onClick={onRemove}
          variant="blue"
          size="sm"
          className="w-full font-semibold"
        >
          Continue
          {loading && <Spinner />}
        </Button>
        <DialogClose asChild>
          <Button variant="hint" size="sm" className="h-7 w-fit">
            Cancel
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

const options = [
  "No longer need access to Notion",
  "Not using it enough",
  "Too expensive",
  "Switching to another tool",
  "No longer works here",
  "Switching to another Notion workspace",
  "Other",
];
