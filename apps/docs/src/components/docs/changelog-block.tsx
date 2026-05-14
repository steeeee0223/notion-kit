import React from "react";
import defaultMdxComponents from "fumadocs-ui/mdx";

interface ChangelogBlockProps extends React.PropsWithChildren {
  version: string;
}

export function ChangelogBlock({ version, children }: ChangelogBlockProps) {
  return (
    <div className="relative flex w-full scroll-mt-24 flex-wrap items-start gap-2 py-8 [--scroll-mt:9.5rem] md:gap-6">
      <div className="group flex w-40 shrink-0 items-center justify-start gap-1 md:sticky md:top-(--scroll-mt)">
        <defaultMdxComponents.h2
          id={version}
          className="my-6! flex grow-0 items-center"
        >
          <span className="cursor-pointer rounded-lg bg-blue/10 px-2 py-1 text-sm font-medium text-blue">
            {version}
          </span>
        </defaultMdxComponents.h2>
      </div>
      <div className="max-w-full flex-1 overflow-hidden px-0.5">
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
