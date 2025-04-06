import { ModalProvider } from "@notion-kit/modal";

import { Trigger } from "./trigger";

export default function Basic() {
  return (
    <ModalProvider>
      <Trigger />
    </ModalProvider>
  );
}
