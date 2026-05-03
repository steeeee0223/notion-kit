import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod/mini";

import { useTranslation } from "@notion-kit/ui/i18n";
import { Icon } from "@notion-kit/ui/icons";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Spinner,
} from "@notion-kit/ui/primitives";

import type { EmojiRow } from "@/lib/types";

const emojiSchema = z.object({
  name: z.string().check(z.minLength(1)),
  file: z.optional(z.file()),
});
export type EmojiSchema = z.infer<typeof emojiSchema>;

interface EmojiFormProps {
  emoji?: EmojiRow;
  onSave: (data: EmojiSchema) => Promise<void>;
}

export function EmojiForm({ emoji, onSave }: EmojiFormProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "emoji.form",
  });
  const isEdit = emoji !== undefined;

  const [preview, setPreview] = useState<string | null>(emoji?.src ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<EmojiSchema>({
    resolver: zodResolver(emojiSchema),
    defaultValues: { name: emoji?.name ?? "", file: undefined },
  });

  const name = useWatch({ control: form.control, name: "name" });
  const canSave = isEdit ? name.length > 0 : name.length > 0 && !!preview;

  const isSubmitting = form.formState.isSubmitting;
  const submit = form.handleSubmit(async (values) => {
    await onSave(values);
  });

  return (
    <DialogContent
      className="w-70"
      onCloseAutoFocus={() => {
        form.reset();
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
      }}
    >
      <Form {...form}>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader className="items-start">
            <DialogTitle className="text-left">
              {isEdit ? t("edit-title") : t("add-title")}
            </DialogTitle>
            <DialogDescription typography="desc" className="text-left">
              {t("description")}
            </DialogDescription>
          </DialogHeader>
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                {preview ? (
                  <div className="flex flex-col items-center gap-1 rounded bg-default/5 p-3 pb-1">
                    <p className="mb-1 text-xs text-secondary">
                      {t("preview")}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <img
                        src={preview}
                        alt="Light Mode"
                        className="size-12 rounded-lg border border-border bg-white object-contain p-2"
                      />
                      <img
                        src={preview}
                        alt="Dark Mode"
                        className="size-12 rounded-lg border border-border bg-[#191919] object-contain p-2"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="hint"
                      size="xs"
                      onClick={() => fileRef.current?.click()}
                    >
                      {t("replace")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant={null}
                    className="justify-normal bg-default/5 p-3.5 text-secondary"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Icon.Photo className="size-5 shrink-0 fill-icon" />
                    {t("upload")}
                  </Button>
                )}
                <FormControl>
                  <Input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (!selected) return;
                      field.onChange(selected);
                      setPreview(URL.createObjectURL(selected));
                      if (!form.getValues("name") && !isEdit) {
                        const baseName = selected.name
                          .replace(/\.[^.]+$/, "")
                          .replace(/\s+/g, "-");
                        form.setValue("name", baseName);
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name-label")}</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder={t("name-placeholder")}
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="hint"
                size="sm"
                className="font-normal"
              >
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="blue"
              size="sm"
              disabled={!canSave || isSubmitting}
            >
              {t("save")}
              {isSubmitting && <Spinner />}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
