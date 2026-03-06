import { HintButton } from "@/presets/_components";

import { Title } from "./common";

export function SecurityContent() {
  return (
    <>
      <Title title="Teamspace Security" />
      <HintButton
        icon="help"
        label="Learn about teamspace security"
        href="https://www.notion.com/help/intro-to-teamspaces#modify-teamspace-settings"
      />
    </>
  );
}
