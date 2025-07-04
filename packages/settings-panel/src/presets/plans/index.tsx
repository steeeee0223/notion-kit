"use client";

import { Plan } from "@notion-kit/schemas";

import { useSettings } from "../../core";
import { ActivePlanSection } from "./active-plan-section";
import { AllPlansSection } from "./all-plans-section";
import { EducationSection } from "./education-section";
import { FaqSection } from "./faq-section";

export function Plans() {
  const { settings } = useSettings();

  return (
    <div className="space-y-12">
      <ActivePlanSection />
      <AllPlansSection />
      {/* This part is optional! only `free` plan can see this */}
      {settings.workspace.plan === Plan.FREE && <EducationSection />}
      <FaqSection />
    </div>
  );
}
