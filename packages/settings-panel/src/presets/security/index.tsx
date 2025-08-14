import type { TabType } from "../data";
import { GeneralSection } from "./general-section";
import { Info } from "./info";
import { InviteSection } from "./invite-section";

interface SecurityProps {
  onTabChange: (tab: TabType) => void;
}

export function Security({ onTabChange }: SecurityProps) {
  return (
    <div className="space-y-[18px]">
      <Info />
      <GeneralSection />
      <InviteSection onTabChange={onTabChange} />
    </div>
  );
}
