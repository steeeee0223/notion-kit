import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@notion-kit/shadcn";

const meta = {
  title: "Shadcn/Field",

  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const MM = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const YYYY = ["2024", "2025", "2026", "2027", "2028", "2029"];

export const Atonomy: Story = {
  render: () => (
    <form className="w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Payment Method</FieldLegend>
          <FieldDescription>
            All transactions are secure and encrypted
          </FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                Name on Card
              </FieldLabel>
              <Input
                id="checkout-7j9-card-name-43j"
                placeholder="Evil Rabbit"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                Card Number
              </FieldLabel>
              <Input
                id="checkout-7j9-card-number-uw1"
                placeholder="1234 5678 9012 3456"
                required
              />
              <FieldDescription>
                Enter your 16-digit card number
              </FieldDescription>
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="checkout-exp-month-ts6">Month</FieldLabel>
                <Select defaultValue="">
                  <SelectTrigger id="checkout-exp-month-ts6">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {MM.map((v) => (
                      <SelectItem value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-exp-year-f59">
                  Year
                </FieldLabel>
                <Select defaultValue="">
                  <SelectTrigger id="checkout-7j9-exp-year-f59">
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {YYYY.map((v) => (
                      <SelectItem value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
                <Input id="checkout-7j9-cvv" placeholder="123" required />
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend>Billing Address</FieldLegend>
          <FieldDescription>
            The billing address associated with your payment method
          </FieldDescription>
          <FieldGroup>
            <Field orientation="horizontal">
              <Checkbox id="checkout-7j9-same-as-shipping-wgm" defaultChecked />
              <FieldLabel
                htmlFor="checkout-7j9-same-as-shipping-wgm"
                className="font-normal"
              >
                Same as shipping address
              </FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="checkout-7j9-optional-comments">
                Comments
              </FieldLabel>
              <Textarea
                id="checkout-7j9-optional-comments"
                placeholder="Add any additional comments"
                className="resize-none"
              />
            </Field>
          </FieldGroup>
        </FieldSet>
        <Field orientation="horizontal">
          <Button variant="blue" size="md" type="submit">
            Submit
          </Button>
          <Button variant="hint" size="md" type="button">
            Cancel
          </Button>
        </Field>
      </FieldGroup>
    </form>
  ),
};
