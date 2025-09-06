"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Input } from "@notion-kit/shadcn";

import { Content, TextLinks } from "../_components";
import { SettingsSection } from "../../core";

/**
 * @deprecated This settings section is deprecated
 */
export function PublicSection() {
  const fakeDomainName = "fake";
  const site = `${fakeDomainName}.notion.site`;
  const link = `www.notion.so/${fakeDomainName}`;
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("general.public", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <Content
        title={trans.domain.title}
        description={
          <TextLinks
            i18nKey="general.public.domain.description"
            values={{ site, link }}
          />
        }
      >
        <Input className="w-[255px]" defaultValue={fakeDomainName} />
      </Content>
      <Content
        title={trans.public.title}
        description={
          <TextLinks
            i18nKey="general.public.domain.description"
            values={{ site }}
          />
        }
      >
        <Input search placeholder="Select a page shared to web" />
      </Content>
    </SettingsSection>
  );
}
