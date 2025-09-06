import { CircleHelp } from "lucide-react";

import { HintButton } from "../../_components";
import { Title } from "./common";

export function SecurityContent() {
  return (
    <>
      <Title title="Teamspace Security" />
      <HintButton
        icon={CircleHelp}
        label="Learn about teamspace security"
        href="https://www.notion.com/help/intro-to-teamspaces#modify-teamspace-settings"
      />
    </>
  );
}
