import {
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

import type { Feature } from "./feature-card";

export const featureSection1: Feature[] = [
  {
    title: "Code Block",
    desc: "Drop-in syntax highlighting for dozens of languages.",
    icon: <Code />,
    img: "https://images.ctfassets.net/spoqsaf9291f/3ugjrNUTf2hhT9VP4Oip9F/70803c531f06d13c792acff0aaeb264a/feature-code-snippets.avif",
  },
  {
    title: "Toggles",
    desc: "Accessible collapsible sections to keep layouts clean.",
    icon: <ToggleLeft />,
    img: "https://images.ctfassets.net/spoqsaf9291f/4Oki5RWkio4ERen9OKzx3H/75bcf2c2de877df30c1945117e1b5121/feature-toggles.avif",
  },
  {
    title: "Media Embeds",
    desc: "Ready-to-use components for images, Loom, and YouTube.",
    icon: <Video />,
    img: "https://images.ctfassets.net/spoqsaf9291f/7soEygyXG1S25G6K2Aobmo/a510fd0d3af6b6ec79c68596f571e6e0/feature-av-embed.avif",
  },
  {
    title: "Table of Contents",
    desc: "Auto-updating navigation primitive for long-form content.",
    icon: <List />,
    img: "https://images.ctfassets.net/spoqsaf9291f/4qWPmBifXLbokpAAlXInJ0/04fd40a8485a8063fed3161b24036918/feature-toc.avif",
  },
  {
    title: "Charts",
    desc: "Beautiful data visualization components.",
    icon: <BarChart />,
    img: "https://images.ctfassets.net/spoqsaf9291f/64bwBP0S2Pp6xEDr2LaXM/3a36612b9ecc0fc5bda6518221c58216/charts-docs-asset.avif",
  },
  {
    title: "And 50+ more primitives",
    desc: "A comprehensive set of building blocks for your app.",
    icon: <FileText />,
    img: "https://images.ctfassets.net/spoqsaf9291f/6NttEUSDa2kTyI3tIel5Pf/26d2242347e11486fbf33a2b39f550ef/content-types.png",
  },
];

export const featureSection3: Feature[] = [
  {
    title: "Composable Primitives",
    desc: "Components are built to be minimal and composable. Use them individually or combine them to build complex interfaces.",
    icon: <Share />,
    img: "https://images.ctfassets.net/spoqsaf9291f/27ciTNb0QnYo4LFc8Jk4wg/f6d655421b75e00386e95f9bbd14859d/collaborate.png",
  },
  {
    title: "Strictly Type-Safe",
    desc: "Written in TypeScript with first-class support for strict types, giving you autocomplete and confidence across your codebase.",
    icon: <MessageSquare />,
    img: "https://images.ctfassets.net/spoqsaf9291f/7HQzZPPJXdj9BJC9yoXXxo/4dcace400d24ae61245696950e00b5f5/comments.png",
  },
];

export const featureSection4: Feature[] = [
  {
    title: "Open Source",
    desc: "Notion Kit is completely open source and free to use in your personal and commercial projects.",
    icon: <FileText />,
    img: "https://images.ctfassets.net/spoqsaf9291f/5UDvNKPmRVyPOr5Syy9PFS/7d2d0ab90d6bba4af14da8ff1fce81e2/wikis.webp",
  },
  {
    title: "Fully Tested",
    desc: "Backed by comprehensive unit and visual testing, giving you confidence that your UI won't break across updates.",
    icon: <CheckSquare />,
    img: "https://images.ctfassets.net/spoqsaf9291f/2rYIEkdXthYRBXhe9f2Pki/5ae13fbef94fda4568be03cb29f1332c/projects.webp",
  },
];

const link: Feature["link"] = {
  href: "#",
  label: "Try now",
};

export const integrationSection: Feature[] = [
  {
    title: "Next.js",
    desc: "First-class support for the App Router, Server Components, and SSR.",
    icon: <Figma />,
    img: "https://images.ctfassets.net/spoqsaf9291f/4yKefGD9EjKfyap7Vnw3C3/d79cd28144e925da3a6efb515b534b3d/integration-figma.avif",
    link,
  },
  {
    title: "Tailwind CSS",
    desc: "Easily override and customize styles using ubiquitous utility classes.",
    icon: <BarChart />,
    img: "https://images.ctfassets.net/spoqsaf9291f/3JdSwc5mO6mGlpOLeCvccc/374be714ab116e6713434033944033eb/integration-amplitude.avif",
    link,
  },
  {
    title: "Storybook",
    desc: "Preview and test all components in isolation with our comprehensive Storybook.",
    icon: <Github />,
    img: "https://images.ctfassets.net/spoqsaf9291f/BsaYzouAcx2WhuXa2vdDO/61af82f9850a60074138d534d6d75d3b/integration-github.avif",
    link,
  },
];
