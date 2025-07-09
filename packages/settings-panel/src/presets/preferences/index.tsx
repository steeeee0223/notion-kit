"use client";

import { DesktopSection } from "./desktop-section";
import { PreferencesSection } from "./preferences-section";
import { PrivacySection } from "./privacy-section";
import { RegionSection } from "./region-section";

export function Preferences() {
  return (
    <div className="space-y-12">
      <PreferencesSection />
      <RegionSection />
      <DesktopSection />
      <PrivacySection />
    </div>
  );
}
