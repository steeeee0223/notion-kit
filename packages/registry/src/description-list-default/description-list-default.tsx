import {
  DescriptionItem,
  DescriptionList,
} from "@notion-kit/ui/description-list";

export default function Default() {
  return (
    <DescriptionList className="w-full max-w-md">
      <DescriptionItem label="Status" value="Active" />
      <DescriptionItem label="Plan" value="Team" />
      <DescriptionItem
        label="API key"
        value="sk_live_51J...9f2"
        mono
        copyValue="sk_live_51J8f9a29f2"
      />
      <DescriptionItem label="Created" value="Jan 3, 2026" />
    </DescriptionList>
  );
}
