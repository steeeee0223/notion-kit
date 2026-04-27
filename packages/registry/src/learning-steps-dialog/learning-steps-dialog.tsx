"use client";

import * as React from "react";

import { cn } from "@notion-kit/cn";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@notion-kit/shadcn";

interface LearningStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  videoUrl: string;
}

interface LearningStepsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  steps: LearningStep[];
  onComplete?: () => void;
}

function PaginationDot({
  active,
  index,
  total,
  onClick,
}: {
  active: boolean;
  index: number;
  total: number;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      tabIndex={0}
      aria-label={`Slide ${index + 1} of ${total}`}
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "size-1.5 animate-bg-in cursor-pointer rounded-full border-none p-0 select-none",
        active ? "bg-icon" : "bg-default/20",
      )}
    />
  );
}

function VideoPreview({ src }: { src: string }) {
  const videoSrc = `${src}?playsinline=true&dnt=true&autoplay=true&background=true&loop=true&muted=true`;

  return (
    <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[10px] border-[1.5px] border-border bg-input">
      <div className="aspect-240/319 h-full w-auto shrink-0">
        <div className="relative w-full pb-[132.917%]">
          <iframe
            title="Video preview"
            allowFullScreen
            src={videoSrc}
            className="absolute inset-s-0 top-0 size-full border-0 bg-transparent opacity-100 shadow-[0_1px_0_0_var(--border)] transition-opacity duration-220"
          />
        </div>
      </div>
    </div>
  );
}

function LearningStepsDialog({
  open,
  onOpenChange,
  steps,
  onComplete,
}: LearningStepsDialogProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete?.();
      onOpenChange?.(false);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  if (!step) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        noTitle
        className="w-auto max-w-none overflow-hidden rounded-xl bg-modal shadow-lg"
      >
        <div className="flex h-[500px] gap-2 p-2">
          <div className="flex w-[369px] min-w-0 shrink-0 flex-col justify-between px-6 pe-4 pt-6 pb-4">
            <div className="flex w-[292px] flex-col justify-center gap-1 pt-[86px]">
              <div className="mb-4">{step.icon}</div>
              <DialogTitle className="text-start text-[30px]/9">
                {step.title}
              </DialogTitle>
              <DialogDescription className="text-start text-sm/5 font-medium">
                {step.description}
              </DialogDescription>
            </div>

            <div className="flex min-h-8 items-center justify-between">
              <div
                role="tablist"
                aria-label={`Slide ${currentStep + 1} of ${steps.length}`}
                className="flex items-center gap-2"
              >
                {steps.map((_, i) => (
                  <PaginationDot
                    key={i}
                    active={i === currentStep}
                    index={i}
                    total={steps.length}
                    onClick={() => setCurrentStep(i)}
                  />
                ))}
              </div>

              <Button variant="hint" size="sm" onClick={handleNext}>
                {isLast ? "Done" : "Next"}
              </Button>
            </div>
          </div>

          <VideoPreview src={step.videoUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { LearningStepsDialog };
export type { LearningStep, LearningStepsDialogProps };
