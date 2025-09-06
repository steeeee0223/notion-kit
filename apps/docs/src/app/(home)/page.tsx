import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@notion-kit/shadcn";

import { FeatureSection, HeroSection } from "./_components";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8 pb-16">
      <HeroSection />
      <FeatureSection />

      <section className="container space-y-6 px-4 md:px-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Showcases</h2>
          <p className="text-secondary">
            Helpful resources & examples to get you started
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Storybook</CardTitle>
              <CardDescription>
                Explore all components and their variants
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button size="md" className="w-full" asChild>
                <Link href="https://notion-kit.vercel.app/">
                  View Storybook
                  <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Notion Table</CardTitle>
              <CardDescription>
                A powerful database table component for your app
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button size="md" className="w-full" asChild>
                <Link href="https://notion-table-view.vercel.app/">
                  View Demo
                  <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Notion Sass</CardTitle>
              <CardDescription>
                A Notion Sass starter kit with authentication and organization
                implemented.
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button size="md" className="w-full" asChild>
                <Link href="https://notion-sass-demo.vercel.app/">
                  View App
                  <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="container mt-8">
        <Card className="border-none bg-primary/5">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-4 py-8 md:flex-row">
            <div>
              <h3 className="mb-2 text-xl font-semibold">
                Ready to get started?
              </h3>
              <p className="text-muted">
                Create an account and start building with our APIs today.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="md" asChild>
                <Link href="/docs">
                  Read the Docs
                  <ExternalLink />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
