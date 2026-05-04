import { cn } from "@notion-kit/cn";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  variant?: "solid" | "dashed";
}

function LoaderDashed(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}

function LoaderCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle
        cx="7"
        cy="7"
        r="6.25"
        fill="none"
        strokeWidth="1.5"
        className="stroke-border"
      />
      <circle
        cx="7"
        cy="7"
        r="6.25"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="39.269908169872416"
        strokeDashoffset="26.31083847381452"
        className="stroke-current"
      />
    </svg>
  );
}

function Spinner({ variant, className, ...props }: SpinnerProps) {
  const Icon = variant === "dashed" ? LoaderDashed : LoaderCircle;

  return (
    <Icon
      role="status"
      aria-label="Loading"
      className={cn(
        "block size-4 shrink-0 animate-spin fill-current",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
