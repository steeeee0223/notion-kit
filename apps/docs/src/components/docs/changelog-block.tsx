import React from "react";

interface ChangelogBlockProps extends React.PropsWithChildren {
  version: string;
}

export function ChangelogBlock({ version, children }: ChangelogBlockProps) {
  return (
    <div
      id={version}
      className="relative flex w-full scroll-mt-24 flex-wrap items-start gap-2 py-8 [--scroll-mt:9.5rem] md:gap-6"
    >
      <div className="group flex w-40 shrink-0 items-center justify-start gap-1 md:sticky md:top-(--scroll-mt)">
        <div className="flex grow-0 cursor-pointer items-center justify-center rounded-lg bg-blue/5 px-2 py-1 text-sm font-medium text-blue">
          {version}
        </div>
        <a
          href={`#${version}`}
          className="group/link flex items-center border-0 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-0"
          aria-label="Navigate to changelog"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-main text-muted shadow-sm ring-1 ring-border hover:ring-border/60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              height="12px"
              viewBox="0 0 576 512"
            >
              <path d="M0 256C0 167.6 71.6 96 160 96h72c13.3 0 24 10.7 24 24s-10.7 24-24 24H160C98.1 144 48 194.1 48 256s50.1 112 112 112h72c13.3 0 24 10.7 24 24s-10.7 24-24 24H160C71.6 416 0 344.4 0 256zm576 0c0 88.4-71.6 160-160 160H344c-13.3 0-24-10.7-24-24s10.7-24 24-24h72c61.9 0 112-50.1 112-112s-50.1-112-112-112H344c-13.3 0-24-10.7-24-24s10.7-24 24-24h72c88.4 0 160 71.6 160 160zM184 232H392c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
            </svg>
          </div>
        </a>
      </div>
      <div className="max-w-full flex-1 overflow-hidden px-0.5">
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
