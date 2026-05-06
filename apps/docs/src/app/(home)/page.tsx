/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { Button } from "@notion-kit/ui/primitives";

import {
  FeatureCard,
  featureSection1,
  featureSection3,
  featureSection4,
  integrationSection,
} from "./_components";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col pb-16">
      {/* Disclaimer Banner */}
      <div className="bg-blue/10 px-4 py-3 text-center text-sm text-blue">
        All images and illustrations on this page are the property of Notion.
        Please support them by checking out the official{" "}
        <Link
          href="https://notion.so"
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline hover:text-red"
        >
          Notion App
        </Link>
        .
      </div>

      {/* Hero Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <header
            className={cn(
              "grid w-full gap-x-7 gap-y-5",
              "gap-y-3 lg:grid-flow-col lg:grid-rows-[1fr_repeat(4,max-content)_1fr]",
            )}
          >
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">
              Docs
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight lg:max-w-100">
              The next gen of UI components
            </h1>
            <p className="text-lg text-secondary md:text-xl lg:max-w-100">
              Simple. Powerful. Beautiful. Build Notion-style applications
              efficiently with our flexible React building blocks.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="blue"
                size="lg"
                className="rounded-md px-5"
                asChild
              >
                <Link href="#">Browse Components</Link>
              </Button>
              <Button
                variant="soft-blue"
                size="lg"
                className="rounded-md px-5"
                asChild
              >
                <Link href="#">Read the docs</Link>
              </Button>
            </div>
            <div className="-order-1 mx-auto w-full overflow-hidden lg:order-[unset] lg:col-2 lg:row-span-full">
              <img
                src="https://images.ctfassets.net/spoqsaf9291f/5RcoNncfzeuqS7V5qqelRJ/81e4b42053f8937bbbdb4842f0fcdc72/docs-hero.png"
                alt="AI meeting notes"
                className="w-full object-cover"
              />
            </div>
          </header>
        </div>
      </section>

      {/* Feature Grid 1 */}
      <section className="bg-popover py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Pre-built components for rich text and docs
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureSection1.map((feature, i) => (
              <FeatureCard key={i} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section 2 */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Bring your own design system or extend with Tailwind
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center overflow-hidden rounded-2xl bg-input shadow-lg md:flex-row">
              <div className="flex-1 p-8 md:p-12">
                <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                  Notion-styled & Flexible by default
                </h3>
                <p className="text-lg text-secondary">
                  Notion Kit components are designed to adapt to your brand,
                  whether you use Tailwind CSS or your own custom styling
                  solution.
                </p>
              </div>
              <div className="flex-1 overflow-hidden p-6 md:p-12 md:pl-0">
                <div className="overflow-hidden rounded-lg border shadow-lg">
                  <img
                    src="https://images.ctfassets.net/spoqsaf9291f/6COqnZ2QTZvnbICX7PYM1H/6cb3d833085349fa15befbd5fb2f5a0d/image.png"
                    alt="Workspace organization"
                    className="w-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-input p-8 text-center shadow-lg md:p-12">
              <blockquote className="mx-auto max-w-3xl text-xl/relaxed font-medium italic md:text-2xl">
                "Notion Kit saved us weeks of UI development time. We just
                dropped the components into our React app and styled them to
                match our brand in minutes."
              </blockquote>
              <div className="mt-6 font-semibold">Frontend Engineer</div>
              <div className="text-sm text-secondary">
                Building a Notion-like Workspace
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3 */}
      <section className="bg-popover py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Built for modern React development
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featureSection3.map((feature, i) => (
              <FeatureCard key={i} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center md:px-6">
          <h2 className="mb-16 text-3xl font-bold tracking-tight md:text-4xl">
            Built for whatever you're creating
          </h2>
          <div className="mx-auto mb-16 max-w-4xl overflow-hidden rounded-lg">
            <img
              src="https://images.ctfassets.net/spoqsaf9291f/6qIIIgDbblzxbMzQrUF2TK/f91004484b6846a1b25b6872a930eb22/Three_hands_drawing.png"
              alt="Illustration"
              className="mx-auto h-auto max-w-full object-cover"
            />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "SaaS Applications",
                desc: "Embed beautiful, Notion-like note-taking and document editing experiences directly into your product.",
                link: "View Showcase",
              },
              {
                title: "Internal Tools",
                desc: "Quickly scaffold rich text editors and complex data tables for your internal admin dashboards.",
                link: "View Showcase",
              },
              {
                title: "Documentation Sites",
                desc: "Create engaging, interactive, and highly readable technical documentation.",
                link: "View Showcase",
              },
            ].map((pillar, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <h3 className="mb-3 text-xl font-bold">{pillar.title}</h3>
                <p className="mb-6 text-secondary">{pillar.desc}</p>
                <Link
                  href="#"
                  className="inline-flex items-center font-semibold text-primary underline decoration-primary underline-offset-4 hover:border-b-2"
                >
                  {pillar.link} <ArrowRight className="ml-1 size-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section 4 */}
      <section className="bg-popover py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need, right out of the box
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featureSection4.map((feature, i) => (
              <FeatureCard key={i} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              Works seamlessly with your favorite modern React tools.
            </h2>
            <Link
              href="#"
              className="inline-flex items-center font-semibold whitespace-nowrap text-primary underline decoration-primary underline-offset-4 hover:border-b-2"
            >
              Read the installation guide <ArrowRight className="ml-1 size-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {integrationSection.map((integration, i) => (
              <FeatureCard key={i} feature={integration} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
