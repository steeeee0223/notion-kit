"use client";

import { useState } from "react";

import { SingleImageDropzone } from "@notion-kit/ui/single-image-dropzone";

export default function Default() {
  const [file, setFile] = useState<File>();

  return <SingleImageDropzone value={file} onChange={setFile} />;
}
