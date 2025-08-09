"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  Input,
} from "@notion-kit/shadcn";

const urlSchema = z.object({
  url: z
    .url({ error: "Invalid URL format" })
    .min(1, { error: "URL should not be empty" }),
});

interface UrlFormProps {
  disabled?: boolean;
  onUrlSubmit?: (url: string) => void;
}

export const UrlForm: React.FC<UrlFormProps> = ({ onUrlSubmit, disabled }) => {
  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: "" },
  });

  const onSubmit = (values: z.infer<typeof urlSchema>) => {
    onUrlSubmit?.(values.url);
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center gap-x-2"
      >
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="h-7 flex-1">
              <FormControl>
                <Input
                  clear
                  disabled={disabled}
                  type="url"
                  placeholder="Paste an image link..."
                  {...field}
                  onCancel={() => form.setValue("url", "")}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="blue"
          size="sm"
          className="h-7"
          disabled={disabled}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};
