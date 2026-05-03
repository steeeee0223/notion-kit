"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/primitives";

import { cn } from "@notion-kit/cn";

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

interface PaginationDotProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

function PaginationDot({ active, label, onClick }: PaginationDotProps) {
  return (
    <Button
      role="tab"
      tabIndex={0}
      aria-label={label}
      aria-selected={active}
      onClick={onClick}
      variant={null}
      size="circle"
      className={cn("size-1.5", active ? "bg-icon" : "bg-default/20")}
    />
  );
}

function VideoPreview({ src }: { src: string }) {
  const videoSrc = `${src}?playsinline=true&dnt=true&autoplay=true&background=true&loop=true&muted=true`;

  return (
    <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg border-[1.5px] border-border bg-input">
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
  const [currentStep, setCurrentStep] = useState(0);
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
        className="w-auto max-w-none overflow-hidden rounded-lg"
      >
        <div className="flex h-[500px] gap-2 p-2">
          {/* Left panel */}
          <div className="flex w-[369px] min-w-0 shrink-0 flex-col justify-between px-6 pe-4 pt-6 pb-4">
            {/* Header */}
            <DialogHeader className="pt-[86px]">
              <div className="mb-4">{step.icon}</div>
              <DialogTitle className="text-[30px]/9">{step.title}</DialogTitle>
              <DialogDescription>{step.description}</DialogDescription>
            </DialogHeader>
            {/* Footer */}
            <DialogFooter className="min-h-8 flex-row justify-between">
              <div
                role="tablist"
                aria-label={`Slide ${currentStep + 1} of ${steps.length}`}
                className="flex items-center gap-2"
              >
                {steps.map((_, i) => (
                  <PaginationDot
                    key={i}
                    active={i === currentStep}
                    label={`Slide ${i + 1} of ${steps.length}`}
                    onClick={() => setCurrentStep(i)}
                  />
                ))}
              </div>
              <Button variant="hint" size="sm" onClick={handleNext}>
                {isLast ? "Done" : "Next"}
              </Button>
            </DialogFooter>
          </div>
          {/* Right panel */}
          <VideoPreview src={step.videoUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { LearningStepsDialog };
export type { LearningStep, LearningStepsDialogProps };
