"use client";

import { useState } from "react";

import { Cover } from "@notion-kit/cover";

const NOTION_IMAGE =
  "https://www.notion.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fspoqsaf9291f%2F5RcoNncfzeuqS7V5qqelRJ%2F81e4b42053f8937bbbdb4842f0fcdc72%2Fdocs-hero.png&w=3840&q=75";
const UNSPLASH_ACCESS_KEY = "UNSPLASH_ACCESS_KEY";

export default function Default() {
  const [cover, setCover] = useState(NOTION_IMAGE);

  return (
    <Cover
      url={cover}
      unsplashAPIKey={UNSPLASH_ACCESS_KEY}
      onSelect={setCover}
      onUpload={(file) => setCover(URL.createObjectURL(file))}
      onRemove={() => setCover(NOTION_IMAGE)}
    />
  );
}
