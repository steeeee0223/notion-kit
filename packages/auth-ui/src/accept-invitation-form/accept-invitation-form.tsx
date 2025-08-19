"use client";

import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Button, Form } from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

import { useAcceptInvitationForm } from "./use-accept-invitation-form";

interface AcceptInvitationFormProps {
  invitationId: string;
  workspace: { name: string; icon: IconData };
}

export function AcceptInvitationForm({
  invitationId,
  workspace,
}: AcceptInvitationFormProps) {
  const { form, submit } = useAcceptInvitationForm(invitationId);

  return (
    <div className="flex flex-col items-center gap-12 p-10">
      <div className="flex w-80 flex-col items-center gap-4">
        <IconBlock icon={workspace.icon} size="lg" />
        <h1 className="flex w-full flex-col text-center text-xl font-medium">
          Join to see this page in {workspace.name}
        </h1>
      </div>
      <Form {...form}>
        <form onSubmit={submit} className="w-60">
          <Button
            type="submit"
            variant="blue"
            size="md"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Spinner className="text-current" />
            )}
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}
