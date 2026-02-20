"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Icon } from "@notion-kit/icons";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Form,
} from "@notion-kit/shadcn";

import { BillingDetails } from "./billing-details";
import { BillingOptions } from "./billing-options";
import { ConfirmSection } from "./confirm-section";
import { PaymentSection } from "./payment-section";
import { upgradeSchema, type Plan, type UpgradeSchema } from "./types";

interface UpgradeProps {
  plan: Plan;
  description?: string;
  defaultName?: string;
  defaultBusinessName?: string;
  onUpgrade?: (data: UpgradeSchema) => Promise<void>;
}

export function Upgrade({
  plan,
  description,
  defaultName = "",
  defaultBusinessName = "",
  onUpgrade,
}: UpgradeProps) {
  const form = useForm<UpgradeSchema>({
    resolver: zodResolver(upgradeSchema),
    defaultValues: {
      name: defaultName,
      businessName: defaultBusinessName,
      vatId: "",
      billingInterval: "month",
      termsAccepted: false as unknown as true,
    },
  });
  const submit = form.handleSubmit(async (data) => {
    await onUpgrade?.(data);
  });

  return (
    <DialogContent className="w-[830px] max-w-[90vw]">
      <Form {...form}>
        <form onSubmit={submit} className="flex flex-col gap-9">
          <DialogHeader className="items-start text-left">
            <Icon.ArrowInCircleUpFill className="-ml-1 size-8 fill-blue" />
            <DialogTitle className="text-left text-[22px]/[26px]">
              Upgrade to the {plan.name} plan
            </DialogTitle>
            {description && (
              <DialogDescription typography="h2" className="text-left">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Left column — Billing form */}
            <div className="flex min-w-0 flex-1 flex-col gap-3.5">
              <BillingDetails />
              <PaymentSection />
            </div>
            {/* Right column — Billing options + Confirm */}
            <div className="flex w-full shrink-0 flex-col gap-7 md:w-[312px]">
              <BillingOptions plan={plan} />
              <ConfirmSection plan={plan} />
            </div>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
