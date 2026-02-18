import React, { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button, Input, Label, Separator } from "@notion-kit/shadcn";
import { SingleImageDropzone } from "@notion-kit/single-image-dropzone";

function deriveNameFromSource(source: string | File): string {
  if (source instanceof File) {
    return source.name.replace(/\.[^.]+$/, "");
  }
  try {
    const parsed = new URL(source);
    const filename = parsed.pathname.split("/").pop() ?? source;
    return filename.replace(/\.[^.]+$/, "") || source;
  } catch {
    return source;
  }
}

interface UploadFormResult {
  name: string;
  url: string;
}

interface UploadFormProps {
  disabled?: boolean;
  onSubmit?: (result: UploadFormResult) => void;
  onCancel?: () => void;
}

export function UploadForm({ disabled, onSubmit, onCancel }: UploadFormProps) {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File>();
  const [name, setName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [urlConfirmed, setUrlConfirmed] = useState(false);

  // Preview: file always shows, URL shows only after blur
  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (urlConfirmed && url.trim()) return url.trim();
    return null;
  }, [file, urlConfirmed, url]);

  const hasSource = Boolean(file ?? url.trim());

  const handleFileChange = (file?: File) => {
    setFile(file);
    if (file) {
      setUrl("");
      setUrlConfirmed(false);
      if (!nameEdited) setName(deriveNameFromSource(file));
    } else if (!nameEdited) {
      setName("");
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setUrl(v);
    setFile(undefined);
    setUrlConfirmed(false);
    if (!nameEdited && v.trim()) setName(deriveNameFromSource(v));
    if (!v.trim()) setName("");
  };

  const handleUrlBlur = () => {
    if (url.trim()) setUrlConfirmed(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameEdited(true);
  };

  const handleReplace = () => {
    setFile(undefined);
    setUrl("");
    setUrlConfirmed(false);
    if (!nameEdited) setName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSource) return;
    const resolvedUrl = file ? URL.createObjectURL(file) : url.trim();
    const resolvedName = name.trim() || deriveNameFromSource(file ?? url);
    onSubmit?.({ name: resolvedName, url: resolvedUrl });
    // reset
    setFile(undefined);
    setUrl("");
    setUrlConfirmed(false);
    setName("");
    setNameEdited(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Header */}
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-primary">Add custom emoji</h3>
        <p className="text-xs text-muted">
          Custom emoji can be used by anyone in your workspace
        </p>
      </div>
      {/* Preview — shown when confirmed URL or file is present */}
      {previewUrl ? (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-input p-4">
          <span className="text-xs text-muted">Preview</span>
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-lg bg-[#191919]">
              <img
                src={previewUrl}
                alt="Preview dark"
                className="size-10 rounded object-contain"
              />
            </div>
            <div className="flex size-14 items-center justify-center rounded-lg bg-white">
              <img
                src={previewUrl}
                alt="Preview light"
                className="size-10 rounded object-contain"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="soft-blue"
            size="xs"
            onClick={handleReplace}
          >
            <RefreshCw className="size-3" />
            Replace
          </Button>
        </div>
      ) : (
        <>
          {/* Image dropzone */}
          <SingleImageDropzone
            className="w-full"
            disabled={disabled}
            value={file}
            onChange={handleFileChange}
          />
          {/* Divider */}
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted">or</span>
            <Separator className="flex-1" />
          </div>
          {/* URL input */}
          <Input
            type="url"
            placeholder="Paste an image link..."
            value={url}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            disabled={disabled}
            clear
            onCancel={() => {
              setUrl("");
              setUrlConfirmed(false);
              if (!nameEdited) setName("");
            }}
          />
        </>
      )}
      {/* Emoji name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="emoji-name" className="text-xs text-muted">
          Emoji name
        </Label>
        <Input
          id="emoji-name"
          placeholder="Enter a name..."
          value={name}
          onChange={handleNameChange}
          disabled={disabled}
        />
      </div>
      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <Button type="button" variant="hint" size="xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="blue"
          size="xs"
          disabled={disabled ?? !hasSource}
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
