import { useTranslation } from "@notion-kit/i18n";
import { Separator, Switch } from "@notion-kit/ui/primitives";

import { SettingsRule, SettingsSection } from "@/core";
import { useEmoji, useEmojiActions } from "@/presets/hooks";
import { EmojisTable } from "@/presets/tables";

export function Emoji() {
  const { t } = useTranslation("settings");
  const trans = t("emoji", { returnObjects: true });

  const { data: emojis } = useEmoji((data) => Object.values(data));
  const { add, update, remove } = useEmojiActions();

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule
        title={trans.limit.title}
        description={trans.limit.description}
      >
        <Switch disabled size="sm" />
      </SettingsRule>
      <Separator />
      <EmojisTable
        data={emojis}
        onCreate={async ({ name, file }) => {
          if (file) await add({ name, file });
        }}
        onEdit={(emoji, data) => update({ id: emoji.id, ...data })}
        onDelete={(emoji) => remove(emoji.id)}
      />
    </SettingsSection>
  );
}
