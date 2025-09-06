import { DomainSection } from "./domain-section";
import { SamlSection } from "./saml-section";
import { ScimSection } from "./scim-section";
import { SetupSection } from "./setup-section";
import { UserSection } from "./user-section";

export function Identity() {
  return (
    <div className="space-y-12">
      <DomainSection />
      <UserSection />
      <SamlSection />
      <ScimSection />
      <SetupSection />
    </div>
  );
}
