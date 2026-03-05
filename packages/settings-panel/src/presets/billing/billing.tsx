"use client";

import { InvoicesSection } from "./invoices-section";
import { PaymentDetailsSection } from "./payment-details-section";
import { PlanSection } from "./plan-section";

export function Billing() {
  return (
    <div className="space-y-12">
      <PlanSection />
      <PaymentDetailsSection />
      <InvoicesSection />
    </div>
  );
}
