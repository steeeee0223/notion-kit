import Link from "next/link";
import {
  ArrowRight,
  BarChart,
  CheckSquare,
  Code,
  Figma,
  FileText,
  Github,
  List,
  MessageSquare,
  Share,
  ToggleLeft,
  Video,
} from "lucide-react";

import { Button } from "@notion-kit/ui/primitives";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col pb-16">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <header className="flex flex-col items-center text-center">
            <p className="mb-4 text-sm font-semibold tracking-wider text-primary uppercase">
              Docs
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              The next gen of notes & docs
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-[700px] text-lg md:text-xl">
              Simple. Powerful. Beautiful. Communicate more efficiently with
              Notion's flexible building blocks.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="#">Get Notion free</Link>
              </Button>
              <Button
                variant="white"
                size="lg"
                className="rounded-full px-8"
                asChild
              >
                <Link href="#">Request a demo</Link>
              </Button>
            </div>
            <div className="mx-auto mt-16 w-full max-w-5xl overflow-hidden rounded-2xl border border-border shadow-2xl">
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
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Go way beyond text & bullet points
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Code snippets",
                desc: "Native syntax highlighting for dozens of languages.",
                icon: Code,
                img: "https://images.ctfassets.net/spoqsaf9291f/3ugjrNUTf2hhT9VP4Oip9F/70803c531f06d13c792acff0aaeb264a/feature-code-snippets.avif",
              },
              {
                title: "Toggles",
                desc: "Collapsible sections make your docs easy to read.",
                icon: ToggleLeft,
                img: "https://images.ctfassets.net/spoqsaf9291f/4Oki5RWkio4ERen9OKzx3H/75bcf2c2de877df30c1945117e1b5121/feature-toggles.avif",
              },
              {
                title: "Images & videos",
                desc: "Embed directly from Loom & YouTube, or upload your own.",
                icon: Video,
                img: "https://images.ctfassets.net/spoqsaf9291f/7soEygyXG1S25G6K2Aobmo/a510fd0d3af6b6ec79c68596f571e6e0/feature-av-embed.avif",
              },
              {
                title: "Table of contents",
                desc: "Click to jump to a section. Updates automatically.",
                icon: List,
                img: "https://images.ctfassets.net/spoqsaf9291f/4qWPmBifXLbokpAAlXInJ0/04fd40a8485a8063fed3161b24036918/feature-toc.avif",
              },
              {
                title: "Charts",
                desc: "Add live charts to any doc.",
                icon: BarChart,
                img: "https://images.ctfassets.net/spoqsaf9291f/64bwBP0S2Pp6xEDr2LaXM/3a36612b9ecc0fc5bda6518221c58216/charts-docs-asset.avif",
              },
              {
                title: "And 50+ more content types",
                desc: "Like a bottomless box of building blocks.",
                icon: FileText,
                img: "https://images.ctfassets.net/spoqsaf9291f/6NttEUSDa2kTyI3tIel5Pf/26d2242347e11486fbf33a2b39f550ef/content-types.png",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-background flex flex-col overflow-hidden rounded-2xl border border-border/50 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="p-6 pb-4">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
                <div className="mt-auto px-6 pb-6">
                  <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <img
                      src={feature.img}
                      alt={feature.title}
                      className="w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section 2 */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Store docs where people can easily find them
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-background flex flex-col items-center overflow-hidden rounded-2xl border border-border/50 shadow-sm md:flex-row">
              <div className="flex-1 p-8 md:p-12">
                <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                  Every team’s files, at a glance
                </h3>
                <p className="text-muted-foreground text-lg">
                  Notion’s sidebar keeps your workspace organized no matter how
                  fast you grow.
                </p>
              </div>
              <div className="flex-1 overflow-hidden p-6 md:p-12 md:pl-0">
                <div className="rounded-xl border border-border shadow-lg">
                  <img
                    src="https://images.ctfassets.net/spoqsaf9291f/6COqnZ2QTZvnbICX7PYM1H/6cb3d833085349fa15befbd5fb2f5a0d/image.png"
                    alt="Workspace organization"
                    className="w-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-primary/5 p-8 text-center md:p-12">
              <blockquote className="mx-auto max-w-3xl text-xl leading-relaxed font-medium italic md:text-2xl">
                "Not only do our streamlined workflows in Notion save us time,
                they also make it easier to stay up to date on task details and
                progress."
              </blockquote>
              <div className="mt-6 font-semibold">Taku Wakasugi</div>
              <div className="text-muted-foreground text-sm">
                Toyota Frontier Research Center, Toyota
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3 */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Get your team on the same page, literally
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Collaborate or co-edit together",
                desc: "Allow others to comment or suggest edits. Just type the @ key to get their attention.",
                icon: Share,
                img: "https://images.ctfassets.net/spoqsaf9291f/27ciTNb0QnYo4LFc8Jk4wg/f6d655421b75e00386e95f9bbd14859d/collaborate.png",
              },
              {
                title: "Comments keep the ball rolling async",
                desc: "A consolidated view of feedback makes it easy to iterate, even across time zones.",
                icon: MessageSquare,
                img: "https://images.ctfassets.net/spoqsaf9291f/7HQzZPPJXdj9BJC9yoXXxo/4dcace400d24ae61245696950e00b5f5/comments.png",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-background flex flex-col overflow-hidden rounded-2xl border border-border/50 shadow-sm"
              >
                <div className="p-8">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
                <div className="mt-auto px-8 pb-8">
                  <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <img
                      src={feature.img}
                      alt={feature.title}
                      className="w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center md:px-6">
          <h2 className="mb-16 text-3xl font-bold tracking-tight md:text-4xl">
            For PMs, designers, engineers, and everyone in between
          </h2>
          <div className="mx-auto mb-16 max-w-4xl overflow-hidden rounded-xl">
            <img
              src="https://images.ctfassets.net/spoqsaf9291f/6qIIIgDbblzxbMzQrUF2TK/f91004484b6846a1b25b6872a930eb22/Three_hands_drawing.png"
              alt="Illustration"
              className="mx-auto h-auto max-w-full object-cover"
            />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Product managers",
                desc: "Connect the roadmap to goals, and keep folks aligned on what’s shipping and when.",
                link: "See how PMs use Notion",
              },
              {
                title: "Designers",
                desc: "Move review rounds forward, prioritize requests, and hit all your creative deadlines.",
                link: "See how designers use Notion",
              },
              {
                title: "Engineers",
                desc: "Ship features faster with sprints, code guidelines, bug fixes & more, all in one place.",
                link: "See how engineers use Notion",
              },
            ].map((pillar, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <h3 className="mb-3 text-xl font-bold">{pillar.title}</h3>
                <p className="text-muted-foreground mb-6">{pillar.desc}</p>
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
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Wikis and Projects included, for the same price
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Wikis",
                desc: "It's hard to move fast with a clunky & disorganized workspace. Centralize all your knowledge in Notion instead.",
                icon: FileText,
                img: "https://images.ctfassets.net/spoqsaf9291f/5UDvNKPmRVyPOr5Syy9PFS/7d2d0ab90d6bba4af14da8ff1fce81e2/wikis.webp",
              },
              {
                title: "Projects",
                desc: "Manage any type of project, no matter the team or size.",
                icon: CheckSquare,
                img: "https://images.ctfassets.net/spoqsaf9291f/2rYIEkdXthYRBXhe9f2Pki/5ae13fbef94fda4568be03cb29f1332c/projects.webp",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-background flex flex-col overflow-hidden rounded-2xl border border-border/50 shadow-sm"
              >
                <div className="p-8 pb-4">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
                <div className="mt-auto px-8 pb-8">
                  <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <img
                      src={feature.img}
                      alt={feature.title}
                      className="w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              Info from Figma, GitHub & more. Easy to share, easy to see.
            </h2>
            <Link
              href="#"
              className="inline-flex items-center font-semibold whitespace-nowrap text-primary underline decoration-primary underline-offset-4 hover:border-b-2"
            >
              See all connections <ArrowRight className="ml-1 size-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Figma",
                desc: "Always share the most updated designs with your team.",
                icon: Figma,
                img: "https://images.ctfassets.net/spoqsaf9291f/4yKefGD9EjKfyap7Vnw3C3/d79cd28144e925da3a6efb515b534b3d/integration-figma.avif",
              },
              {
                title: "Amplitude",
                desc: "Track release metrics, experiment results, and more.",
                icon: BarChart,
                img: "https://images.ctfassets.net/spoqsaf9291f/3JdSwc5mO6mGlpOLeCvccc/374be714ab116e6713434033944033eb/integration-amplitude.avif",
              },
              {
                title: "Github",
                desc: "Bring pull requests, issues, and even repos directly into Notion.",
                icon: Github,
                img: "https://images.ctfassets.net/spoqsaf9291f/BsaYzouAcx2WhuXa2vdDO/61af82f9850a60074138d534d6d75d3b/integration-github.avif",
              },
            ].map((integration, i) => (
              <div
                key={i}
                className="bg-background flex flex-col overflow-hidden rounded-2xl border border-border/50 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="p-8">
                  <h3 className="mb-2 flex items-center gap-2 text-xl font-bold">
                    <integration.icon className="size-5" />
                    {integration.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {integration.desc}
                  </p>
                  <Link
                    href="#"
                    className="inline-flex items-center font-semibold text-primary underline decoration-primary underline-offset-4 hover:border-b-2"
                  >
                    Try now <ArrowRight className="ml-1 size-4" />
                  </Link>
                </div>
                <div className="mt-auto px-8 pb-8">
                  <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <img
                      src={integration.img}
                      alt={integration.title}
                      className="w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
