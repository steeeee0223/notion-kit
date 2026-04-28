"use client";

import { useState } from "react";

import { TagsInput } from "@notion-kit/tags-input";

export default function Default() {
  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState("");

  return (
    <TagsInput
      placeholder="Search name or emails"
      value={{ tags: emails, input }}
      onTagsChange={setEmails}
      onInputChange={setInput}
    />
  );
}
