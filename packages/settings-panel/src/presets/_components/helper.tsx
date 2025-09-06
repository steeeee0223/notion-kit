"use client";

import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { CircleHelp, Construction } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { Trans, TransProps } from "@notion-kit/i18n";
import {
  AvatarFallback,
  AvatarImage,
  Avatar as AvatarRoot,
  Button,
} from "@notion-kit/shadcn";

import { SettingsPlan } from "../../core";

interface HintButtonProps {
  className?: string;
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
}

export function HintButton({
  icon: Icon,
  label,
  href,
  className,
  onClick,
}: HintButtonProps) {
  const click = () => {
    if (!href) return onClick?.();
    window.open(href);
  };
  return (
    <Button
      type="button"
      variant="hint"
      size="xs"
      tabIndex={-1}
      className={cn("-ml-1.5", className)}
      onClick={click}
    >
      <Icon className="size-3.5" />
      {label}
    </Button>
  );
}

interface ContentProps extends React.PropsWithChildren {
  title?: string;
  description?: React.ReactNode;
  plan?: string;
  hint?: string;
  href?: string;
}

export function Content({
  children,
  title,
  description,
  plan,
  hint,
  href,
}: ContentProps) {
  return (
    <div>
      {title && (
        <div className="mb-2 flex w-auto items-center text-sm font-normal">
          {title}
          {!!plan && <SettingsPlan plan={plan} />}
        </div>
      )}
      <div className="flex items-center">{children}</div>
      {description && (
        <p className="mt-2 text-xs text-secondary">{description}</p>
      )}
      {hint && (
        <div className="mt-3">
          <HintButton icon={CircleHelp} label={hint} href={href} />
        </div>
      )}
    </div>
  );
}

interface TextLinksProps
  extends Pick<TransProps, "i18nKey" | "values">,
    React.ComponentProps<"a"> {
  hrefs?: string | string[];
}

export function TextLinks({
  i18nKey,
  values,
  children = "-",
  hrefs,
  ...props
}: TextLinksProps) {
  const Links = useMemo(() => {
    // if (hrefs === undefined) return;
    const urls = Array.isArray(hrefs) ? hrefs : [hrefs];
    return urls.map((url, i) => (
      <a
        key={i}
        rel="noopener noreferrer"
        className="cursor-pointer underline transition select-none hover:text-red"
        {...props}
        href={url}
      >
        {children}
      </a>
    ));
  }, [children, props, hrefs]);

  return <Trans i18nKey={i18nKey} values={values} components={Links} />;
}

export function NotImplemented() {
  return (
    <div className="inline-flex w-full items-center rounded-sm bg-default/5 p-4 text-sm font-medium">
      <Construction color="#b9aa4b" className="mr-2 size-5" />
      Under construction
    </div>
  );
}

interface AvatarProps {
  className?: string;
  src?: string;
  fallback: string;
}

export function Avatar({ className, src, fallback }: AvatarProps) {
  return (
    <AvatarRoot className={cn("size-5", className)}>
      <AvatarImage src={src} alt="" />
      <AvatarFallback className="uppercase">
        {fallback.at(0) ?? ""}
      </AvatarFallback>
    </AvatarRoot>
  );
}
