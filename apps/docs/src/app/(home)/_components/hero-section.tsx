"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@notion-kit/shadcn";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-main py-12 md:py-16 lg:py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="bg-grid-pattern-light dark:bg-grid-pattern-dark absolute inset-0" />
      </div>

      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Developer Portal
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Notion UI
          </h1>
          <p className="max-w-[700px] text-secondary md:text-xl">
            A duplication of beautifully-designed Notion design system.
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button variant="blue" size="md" asChild>
              <Link href="/docs">
                Get Started
                <ArrowRight />
              </Link>
            </Button>
            <Button size="md" asChild>
              <Link href="#">Try Sandbox</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
