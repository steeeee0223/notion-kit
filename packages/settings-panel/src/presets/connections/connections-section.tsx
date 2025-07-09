"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTranslation } from "@notion-kit/i18n";
import { toast } from "@notion-kit/shadcn";

import { SettingsSection, useSettings } from "../../core";
import { createDefaultFn, QUERY_KEYS, type Connection } from "../../lib";
import { ConnectionsTable } from "../tables";

interface ConnectionsSectionProps {
  connections: Connection[];
}

export function ConnectionsSection({ connections }: ConnectionsSectionProps) {
  const { settings, connections: actions } = useSettings();
  const queryKey = QUERY_KEYS.connections(settings.account.id);
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("my-connections.title", { returnObjects: true });
  /** Actions */
  const queryClient = useQueryClient();
  const { mutate: unlink } = useMutation({
    mutationFn: actions?.delete ?? createDefaultFn(),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Connection[]>(queryKey);
      queryClient.setQueryData<Connection[]>(queryKey, (prev) => {
        if (!prev) return [];
        return prev.filter((conn) => conn.id !== payload.id);
      });
      return { previous };
    },
    onSuccess: () => toast.success("Connection unlink successfully"),
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error("Unlink connection failed", { description: error.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return (
    <SettingsSection title={trans} hideSeparator>
      <ConnectionsTable
        data={connections}
        // TODO impl. add connection
        onDisconnect={unlink}
      />
    </SettingsSection>
  );
}
