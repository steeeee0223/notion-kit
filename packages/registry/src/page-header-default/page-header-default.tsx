import { Icon } from "@notion-kit/icons";
import { PageHeader } from "@notion-kit/ui/page-header";
import { Button, Tabs, TabsList, TabsTrigger } from "@notion-kit/ui/primitives";

export default function Default() {
  return (
    <PageHeader
      className="w-full max-w-2xl"
      breadcrumb={<span>Workspace / Invoices</span>}
      title="Invoices"
      description="Everything captured from your connected sources."
      actions={
        <>
          <Button variant="primary" size="sm">
            Export
          </Button>
          <Button variant="blue" size="sm">
            <Icon.Plus className="size-4" />
            New invoice
          </Button>
        </>
      }
      meta={
        <Tabs defaultValue="all">
          <TabsList variant="segmented">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    />
  );
}
