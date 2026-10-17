import { useState } from "react";

import { AlertModal } from "@notion-kit/ui/alert-modal";
import { Button, Dialog, DialogTrigger } from "@notion-kit/ui/primitives";

export default function DialogDefault() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="md">Open</Button>} />
      <AlertModal
        title="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
        primary="Continue"
        secondary="Cancel"
        onTrigger={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setOpen(false);
        }}
      />
    </Dialog>
  );
}
