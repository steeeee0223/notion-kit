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
    title: "Code snippets",
    desc: "Native syntax highlighting for dozens of languages.",
    icon: <Code />,
    img: "https://images.ctfassets.net/spoqsaf9291f/3ugjrNUTf2hhT9VP4Oip9F/70803c531f06d13c792acff0aaeb264a/feature-code-snippets.avif",
  },
  {
    title: "Toggles",
    desc: "Collapsible sections make your docs easy to read.",
    icon: <ToggleLeft />,
    img: "https://images.ctfassets.net/spoqsaf9291f/4Oki5RWkio4ERen9OKzx3H/75bcf2c2de877df30c1945117e1b5121/feature-toggles.avif",
  },
  {
    title: "Images & videos",
    desc: "Embed directly from Loom & YouTube, or upload your own.",
    icon: <Video />,
    img: "https://images.ctfassets.net/spoqsaf9291f/7soEygyXG1S25G6K2Aobmo/a510fd0d3af6b6ec79c68596f571e6e0/feature-av-embed.avif",
  },
  {
    title: "Table of contents",
    desc: "Click to jump to a section. Updates automatically.",
    icon: <List />,
    img: "https://images.ctfassets.net/spoqsaf9291f/4qWPmBifXLbokpAAlXInJ0/04fd40a8485a8063fed3161b24036918/feature-toc.avif",
  },
  {
    title: "Charts",
    desc: "Add live charts to any doc.",
    icon: <BarChart />,
    img: "https://images.ctfassets.net/spoqsaf9291f/64bwBP0S2Pp6xEDr2LaXM/3a36612b9ecc0fc5bda6518221c58216/charts-docs-asset.avif",
  },
  {
    title: "And 50+ more content types",
    desc: "Like a bottomless box of building blocks.",
    icon: <FileText />,
    img: "https://images.ctfassets.net/spoqsaf9291f/6NttEUSDa2kTyI3tIel5Pf/26d2242347e11486fbf33a2b39f550ef/content-types.png",
  },
];

export const featureSection3: Feature[] = [
  {
    title: "Collaborate or co-edit together",
    desc: "Allow others to comment or suggest edits. Just type the @ key to get their attention.",
    icon: <Share />,
    img: "https://images.ctfassets.net/spoqsaf9291f/27ciTNb0QnYo4LFc8Jk4wg/f6d655421b75e00386e95f9bbd14859d/collaborate.png",
  },
  {
    title: "Comments keep the ball rolling async",
    desc: "A consolidated view of feedback makes it easy to iterate, even across time zones.",
    icon: <MessageSquare />,
    img: "https://images.ctfassets.net/spoqsaf9291f/7HQzZPPJXdj9BJC9yoXXxo/4dcace400d24ae61245696950e00b5f5/comments.png",
  },
];

export const featureSection4: Feature[] = [
  {
    title: "Wikis",
    desc: "It's hard to move fast with a clunky & disorganized workspace. Centralize all your knowledge in Notion instead.",
    icon: <FileText />,
    img: "https://images.ctfassets.net/spoqsaf9291f/5UDvNKPmRVyPOr5Syy9PFS/7d2d0ab90d6bba4af14da8ff1fce81e2/wikis.webp",
  },
  {
    title: "Projects",
    desc: "Manage any type of project, no matter the team or size.",
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
    title: "Figma",
    desc: "Always share the most updated designs with your team.",
    icon: <Figma />,
    img: "https://images.ctfassets.net/spoqsaf9291f/4yKefGD9EjKfyap7Vnw3C3/d79cd28144e925da3a6efb515b534b3d/integration-figma.avif",
    link,
  },
  {
    title: "Amplitude",
    desc: "Track release metrics, experiment results, and more.",
    icon: <BarChart />,
    img: "https://images.ctfassets.net/spoqsaf9291f/3JdSwc5mO6mGlpOLeCvccc/374be714ab116e6713434033944033eb/integration-amplitude.avif",
    link,
  },
  {
    title: "Github",
    desc: "Bring pull requests, issues, and even repos directly into Notion.",
    icon: <Github />,
    img: "https://images.ctfassets.net/spoqsaf9291f/BsaYzouAcx2WhuXa2vdDO/61af82f9850a60074138d534d6d75d3b/integration-github.avif",
    link,
  },
];
