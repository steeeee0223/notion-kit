import { Plan } from "@notion-kit/schemas";

import type { UpgradePlan } from "./types";

/** Plan hierarchy for comparison */
const PLAN_RANK: Record<Plan, number> = {
  [Plan.FREE]: 0,
  [Plan.EDUCATION]: 1,
  [Plan.PLUS]: 2,
  [Plan.BUSINESS]: 3,
  [Plan.ENTERPRISE]: 4,
};

/** Returns true if `current` plan is at or above `required` plan */
export function isPlanAbove(current: Plan, required: Plan): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

/** Map plan enum → Upgrade modal Plan type (with pricing) */
export const UPGRADE_PLANS: Partial<Record<Plan, UpgradePlan>> = {
  [Plan.PLUS]: { name: "Plus", monthly: 12, annual: 10 },
  [Plan.BUSINESS]: { name: "Business", monthly: 18, annual: 15 },
  [Plan.ENTERPRISE]: { name: "Enterprise", monthly: 0, annual: 0 },
};

/** Resolve a plan string to the Upgrade modal Plan type */
export function getUpgradePlan(plan: string): UpgradePlan | undefined {
  return UPGRADE_PLANS[plan as Plan];
}
