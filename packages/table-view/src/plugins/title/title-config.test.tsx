import { fireEvent, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { NumberConfigMenuObject } from "@/__tests__/component-objects/number-config-menu";

import { TitleConfig } from "./title-config";
import type { TitleConfig as TitleConfigValue } from "./types";

it("TitleConfig_IconToggle_ReportsUpdatedConfig", async () => {
  const config: TitleConfigValue = { showIcon: true };
  const onChange = vi.fn();
  await NumberConfigMenuObject.renderOpen(
    <TitleConfig config={config} onChange={onChange} propId="title" />,
  );

  fireEvent.click(screen.getByRole("switch", { name: "Show page icon" }));

  const updater = onChange.mock.calls[0]?.[0] as (
    value: TitleConfigValue,
  ) => TitleConfigValue;
  expect(updater(config)).toEqual({ showIcon: false });
});
