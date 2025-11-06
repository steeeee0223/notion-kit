import { Code, Database, FileText, Globe, Lock, Zap } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@notion-kit/shadcn";

export function FeatureSection() {
  return (
    <section className="bg-muted/30 py-12">
      <div className="container px-4 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">
            Why Choose Notion UI
          </h2>
          <p className="mx-auto max-w-150 text-secondary">
            We offer the best experience for developers to build apps on top of
            Notion-styled components.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="h-40 bg-input">
            <CardHeader className="pb-2">
              <Lock className="h-6 w-6 text-primary" />
              <CardTitle className="mt-2">Secure</CardTitle>
              <CardDescription>
                OAuth 2.0, MFA, and encryption at rest and in transit
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-40 bg-input">
            <CardHeader className="pb-2">
              <Zap className="h-6 w-6 text-primary" />
              <CardTitle className="mt-2">Fast</CardTitle>
              <CardDescription>
                &lt;200ms response time for 95% of requests
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-40 bg-input">
            <CardHeader className="pb-2">
              <Database className="h-6 w-6 text-primary" />
              <CardTitle className="mt-2">Scalable</CardTitle>
              <CardDescription>
                Support for 10,000+ concurrent API calls
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-40 bg-input">
            <CardHeader className="pb-2">
              <Code className="h-6 w-6 text-primary" />
              <CardTitle className="mt-2">Developer-First</CardTitle>
              <CardDescription>
                Comprehensive docs, SDKs, and sandbox
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-40 bg-input">
            <CardHeader className="pb-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="mt-2">Well Documented</CardTitle>
              <CardDescription>
                Clear, comprehensive API references
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-40 bg-input">
            <CardHeader className="pb-2">
              <Globe className="h-6 w-6 text-primary" />
              <CardTitle className="mt-2">Global Support</CardTitle>
              <CardDescription>
                24/7 developer support and community
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
