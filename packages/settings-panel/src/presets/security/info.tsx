"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Button } from "@notion-kit/shadcn";

interface CardItemProps {
  title: string;
  description: string;
  action: string;
  more: string;
}

function CardItem({ title, description, action, more }: CardItemProps) {
  return (
    <section className="max-w-[340px] text-sm">
      <header className="font-semibold">{title}</header>
      <p className="mt-1 mb-4 text-secondary">{description}</p>
      <footer className="flex flex-wrap gap-x-3 gap-y-2">
        <Button tabIndex={0} variant="blue" size="sm">
          {action}
        </Button>
        <Button tabIndex={0} size="sm">
          {more}
        </Button>
      </footer>
    </section>
  );
}

export function Info() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("security.cards", { returnObjects: true });

  return (
    <div className="space-y-[18px] rounded-sm border-[1px] border-solid border-border p-4">
      <CardItem {...trans.sso} />
      <CardItem {...trans.scim} />
    </div>
  );
}
