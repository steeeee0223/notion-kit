import React from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

const styles = {
  layout: "flex flex-col relative w-full self-stretch", // autolayout-col autolayout-fill-width
  title: "text-[22px]/[26px] font-semibold tracking-wide", // tx-title-22-semi
  desc: "text-[10px]/[12px] font-normal tracking-wide", // tx-agate-10-*
  bullet: "text-xs font-semibold", // tx-body-13-semi
  item: "font-normal", // tx-body-13-reg
};

interface PlanHeaderProps extends React.PropsWithChildren {
  title: string;
  description: string;
  subtext?: string;
}
export const PlanHeader = ({
  title,
  description,
  subtext,
  children,
}: PlanHeaderProps) => {
  return (
    <div className="w-[150px]">
      <div className={cn(styles.layout, "gap-2.5")}>
        <div className={cn(styles.title, "flex w-full gap-1.5")}>{title}</div>
        <div className={cn(styles.layout, "gap-3")}>
          <div className={cn(styles.layout, "gap-1")}>
            <div className={cn(styles.desc, "text-secondary")}>
              {description}
            </div>
            <div className={cn(styles.desc, "text-[#acaba9]")}>{subtext}</div>
          </div>
          <div className="inline">{children}</div>
        </div>
      </div>
    </div>
  );
};

interface ListCellProps {
  items: string[];
}
export const ListCell = ({ items }: ListCellProps) => (
  <div className="py-3">
    <ul className="my-0 list-none pl-0">
      {items.map((item, i) => (
        <li key={i} className="flex min-h-6 items-center">
          <span className="flex gap-1">
            <div className={styles.bullet}>·</div>
            <div className={styles.item}>{item}</div>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export type ContentCellProps =
  | { type: "value"; value?: string }
  | { type: "check"; checked?: boolean };
export const ContentCell = (props: ContentCellProps) => {
  return (
    <div className={cn(styles.item, "py-3")}>
      {props.type === "value" && (
        <>{props.value ?? <div className="text-muted">&ndash;</div>}</>
      )}
      {props.type === "check" &&
        (props.checked ? (
          <Icon.Check className="size-3.5 shrink-0 fill-primary" />
        ) : (
          <div className="text-muted">&ndash;</div>
        ))}
    </div>
  );
};
