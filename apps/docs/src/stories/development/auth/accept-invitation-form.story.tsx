import { defineStory } from "@/lib/story";
import { authAcceptInvitationForm } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: authAcceptInvitationForm.DefaultExample,
  displayName: "Default",
  args: { initial: { invitationId: "test-invitation-id" } },
  frame: {
    src: "/story/development/auth/accept-invitation-form/Default",
    width: 1280,
    height: 800,
  },
});
