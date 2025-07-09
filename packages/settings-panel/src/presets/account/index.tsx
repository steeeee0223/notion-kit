"use client";

import { AccountSection } from "./account-section";
import { DevicesSection } from "./devices-section";
import { SecuritySection } from "./security-section";
import { SupportSection } from "./support-section";

export function Account() {
  return (
    <div className="space-y-12">
      <AccountSection />
      <SecuritySection />
      <SupportSection />
      <DevicesSection />
    </div>
  );
}
