import type { ComponentProps } from "react";

import {
  LearningStepsDialog,
  type LearningStep,
} from "@notion-kit/ui/learning-steps-dialog";

const sampleSteps: LearningStep[] = [
  {
    icon: (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-orange/20 text-2xl">
        💬
      </div>
    ),
    title: "Q&A agents",
    description:
      "Answers repeat questions using knowledge in Notion and connected tools.",
    videoUrl: "https://player.vimeo.com/video/1167228783",
  },
  {
    icon: (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue/20 text-2xl">
        📊
      </div>
    ),
    title: "Deep research",
    description:
      "Gathers and analyzes information across your workspace to surface key insights.",
    videoUrl: "https://player.vimeo.com/video/1167228783",
  },
  {
    icon: (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-red/20 text-2xl">
        ✍️
      </div>
    ),
    title: "Content drafts",
    description:
      "Generates first drafts based on your notes, docs, and existing content.",
    videoUrl: "https://player.vimeo.com/video/1167228783",
  },
];

interface DefaultProps {
  open?: ComponentProps<typeof LearningStepsDialog>["open"];
}
export function DefaultExample(overrides: DefaultProps) {
  const args = {
    open: true,
    steps: sampleSteps,
    ...overrides,
  } satisfies Partial<ComponentProps<typeof LearningStepsDialog>>;
  return <LearningStepsDialog {...args} />;
}
