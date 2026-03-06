"use client";

import { Plan } from "@notion-kit/schemas";

import { useWorkspace } from "@/presets/hooks";

import { ActivePlanSection } from "./active-plan-section";
import { AllPlansSection } from "./all-plans-section";
import { EducationSection } from "./education-section";
import { FaqSection } from "./faq-section";

export function Plans() {
  const { data: workspace } = useWorkspace();

  return (
    <div className="space-y-12">
      <ActivePlanSection />
      <AllPlansSection />
      {/* This part is optional! only `free` plan can see this */}
      {workspace.plan === Plan.FREE && <EducationSection />}
      <FaqSection />
    </div>
  );
}
