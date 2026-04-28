"use client";

import { useState } from "react";

import { Unsplash } from "@notion-kit/unsplash";

const UNSPLASH_ACCESS_KEY = "UNSPLASH_ACCESS_KEY";

export default function Search() {
  const [url, setUrl] = useState("");

  return (
    <div className="flex w-[540px] flex-col items-center gap-2">
      <div className="flex w-full truncate px-4 text-xl font-medium">
        Selected: {url}
      </div>
      <Unsplash apiKey={UNSPLASH_ACCESS_KEY} onSelect={setUrl} />
    </div>
  );
}
