"use client";

import React, { createContext, use, useId } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { BundledLanguage } from "shiki";
import { codeToHast, codeToHtml } from "shiki";

import { Store, useStore } from "@notion-kit/hooks";

export async function highlight(code: string, lang: BundledLanguage | "text") {
  const out = await codeToHast(code, {
    lang,
    theme: "github-dark",
  });

  return toJsxRuntime(out, {
    Fragment: React.Fragment,
    jsx,
    jsxs,
  }) as React.JSX.Element;
}

export interface CodeBlockState {
  blockId: string;
  code: string;
  html: string;
  lang: string;
  theme?: string;
  caption?: string;
}

interface CodeBlockActions {
  setCaption: (caption: string) => void;
}

class CodeBlockStore extends Store<CodeBlockState> implements CodeBlockActions {
  constructor(initialState?: Partial<CodeBlockState>) {
    super({
      blockId: "",
      code: "",
      lang: "text",
      theme: "github-dark",
      html: "",
      ...initialState,
    });
  }
  updateHtml = async (
    state: Partial<Pick<CodeBlockState, "code" | "lang" | "theme">>,
  ) => {
    const { code, lang, blockId } = this.getSnapshot();
    const html = await codeToHtml(state.code ?? code, {
      lang: state.lang ?? (lang as BundledLanguage),
      theme: state.theme ?? "github-dark",
    });
    this.setState((prev) => ({ ...prev, ...state, html }));
    placeCaretAtEnd(blockId);
  };
  setCaption = (caption: string) => {
    this.setState((prev) => ({ ...prev, caption }));
  };
}

const CodeBlockContext = createContext<{
  state: CodeBlockState;
  store: CodeBlockStore;
} | null>(null);

export function useCodeBlock() {
  const ctx = use(CodeBlockContext);
  if (!ctx) {
    throw new Error("useCodeBlock must be used within a CodeBlockProvider");
  }
  return ctx;
}

export function CodeBlockProvider({ children }: { children: React.ReactNode }) {
  const blockId = useId();
  const ctx = useStore<CodeBlockState, CodeBlockStore>(
    new CodeBlockStore({ blockId }),
  );

  return <CodeBlockContext value={ctx}>{children}</CodeBlockContext>;
}

// TODO not work well
function placeCaretAtEnd(blockId: string) {
  const block = document.querySelector<HTMLElement>(
    `[data-block-id="${blockId}"] [role="textbox"]`,
  );
  if (!block) return;

  block.focus();

  const range = document.createRange();
  range.selectNodeContents(block);
  range.collapse(false); // collapse to end

  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}
