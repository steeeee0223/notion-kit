import React from "react";
import { Step, Steps } from "fumadocs-ui/components/steps";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { cn } from "@notion-kit/cn";

import { ComponentPreview, Installation } from "@/components/docs";

export const mdxComponents: MDXComponents = {
  ...defaultMdxComponents,
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <defaultMdxComponents.table
      className={cn("[&_tbody]:bg-main", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => (
    <defaultMdxComponents.h2
      className={cn(
        "group mt-10 mb-4 flex font-semibold whitespace-pre-wrap",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <defaultMdxComponents.h3
      className={cn(
        "group mt-8 mb-4 flex font-semibold whitespace-pre-wrap",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }: React.ComponentProps<"a">) => (
    <defaultMdxComponents.a
      className={cn(
        "font-semibold text-primary underline decoration-primary underline-offset-4 transition-all hover:border-b-2",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.ComponentProps<"pre">) => (
    <defaultMdxComponents.pre
      className={cn(
        "not-prose text-foreground relative mt-5 mb-8 min-w-0 rounded-2xl border border-border bg-muted p-4 text-sm",
        className,
      )}
      {...props}
    />
  ),
  Callout: ({
    className,
    ...props
  }: React.ComponentProps<typeof defaultMdxComponents.Callout>) => (
    <defaultMdxComponents.Callout
      className={cn(
        "my-4 flex gap-3 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-900 dark:bg-blue-600/20",
        className,
      )}
      {...props}
    />
  ),
  Card: ({
    className,
    ...props
  }: React.ComponentProps<typeof defaultMdxComponents.Card>) => (
    <defaultMdxComponents.Card
      className={cn(
        "group bg-background relative my-2 block w-full cursor-pointer overflow-hidden rounded-2xl border border-border/50 font-normal ring-2 ring-transparent hover:border-primary dark:bg-muted/10",
        className,
      )}
      {...props}
    />
  ),
  Update: ({ date, children }: { date: string; children: React.ReactNode }) => {
    const id = date.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return (
      <div
        id={id}
        className="relative mt-12 flex w-full flex-col items-start gap-4 border-b border-border/50 pb-12 last:border-0 lg:flex-row lg:gap-8"
      >
        <div className="group flex w-full shrink-0 flex-col items-start justify-start lg:sticky lg:top-24 lg:w-[160px]">
          <div className="flex grow-0 items-center justify-center rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            {date}
          </div>
        </div>
        <div className="max-w-full flex-1 overflow-hidden">{children}</div>
      </div>
    );
  },
  Step,
  Steps,
  // Add your custom components here
  ComponentPreview,
  Installation,
};
