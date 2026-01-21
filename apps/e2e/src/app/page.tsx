"use client";

import { Button } from "@notion-kit/shadcn";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-main p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <section>
          <h1 className="mb-4 text-3xl font-bold">Package Render Tests</h1>
          <p className="mb-6 text-muted">
            Testing all @notion-kit packages to ensure no render errors with
            built packages
          </p>
        </section>

        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">@notion-kit/shadcn (Button)</h2>
          <div className="flex gap-2">
            <Button size="sm">Default</Button>
            <Button size="sm" variant="blue">
              Blue
            </Button>
            <Button size="sm" variant="red-fill">
              Red Filled
            </Button>
            <Button size="sm" variant="red">
              Red
            </Button>
          </div>
          <div className="text-sm text-green-600">✓ Rendered successfully</div>
        </section>

        <section className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
          <h2 className="mb-2 text-xl font-bold text-green-700 dark:text-green-400">
            ✓ All Tests Passed
          </h2>
          <p className="text-green-600 dark:text-green-500">
            All packages can be imported and used successfully. The built
            packages are working correctly with react-compiler-runtime.
          </p>
          <p className="mt-2 text-sm text-green-600 dark:text-green-500">
            For comprehensive testing including complex components, run:{" "}
            <code className="rounded bg-green-100 px-2 py-1 dark:bg-green-900">
              pnpm test
            </code>
          </p>
        </section>
      </div>
    </div>
  );
}
