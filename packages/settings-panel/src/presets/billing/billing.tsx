"use client";

import { Plan } from "@notion-kit/schemas";

import { InvoicesSection } from "./invoices-section";
import { PaymentDetailsSection } from "./payment-details-section";
import { PlanSection } from "./plan-section";

interface BillingProps {
  plan?: Plan;
  paymentMethod?: string;
  billedTo?: string;
  billingEmail?: string;
  invoiceEmails?: boolean;
  vatNumber?: string;
  upcomingInvoice?: string;
  onChangePlan?: (plan: Plan) => Promise<void>;
  onEditMethod?: () => void;
  onEditBilledTo?: (address: {
    country: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    businessName?: string;
  }) => Promise<void>;
  onEditEmail?: (email: string) => Promise<void>;
  onToggleInvoiceEmails?: (checked: boolean) => void;
  onEditVat?: () => void;
  onViewInvoice?: () => void;
}

export function Billing({
  plan = Plan.FREE,
  paymentMethod,
  billedTo,
  billingEmail,
  invoiceEmails,
  vatNumber,
  upcomingInvoice,
  onChangePlan,
  onEditMethod,
  onEditBilledTo,
  onEditEmail,
  onToggleInvoiceEmails,
  onEditVat,
  onViewInvoice,
}: BillingProps) {
  return (
    <div className="space-y-12">
      <PlanSection plan={plan} onChangePlan={onChangePlan} />
      <PaymentDetailsSection
        paymentMethod={paymentMethod}
        billedTo={billedTo}
        billingEmail={billingEmail}
        invoiceEmails={invoiceEmails}
        vatNumber={vatNumber}
        onEditMethod={onEditMethod}
        onEditBilledTo={onEditBilledTo}
        onEditEmail={onEditEmail}
        onToggleInvoiceEmails={onToggleInvoiceEmails}
        onEditVat={onEditVat}
      />
      <InvoicesSection
        upcomingInvoice={upcomingInvoice}
        onViewInvoice={onViewInvoice}
      />
    </div>
  );
}
