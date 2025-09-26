"use client";

import React, { createContext, use, useEffect, useId, useMemo } from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";

import { Store, useStore } from "@notion-kit/hooks";

export interface CodeBlockState {
  blockId: string;
  code: string;
  html: string;
  lang: string;
  theme: string;
  caption?: string;
}

interface CodeBlockActions {
  setCaption: (caption: string) => void;
  updateCode: (code: string) => void;
  setLang: (lang: string) => void;
}

class CodeBlockStore extends Store<CodeBlockState> implements CodeBlockActions {
  private highlightTimeout: NodeJS.Timeout | null = null;

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

  highlight = async (code: string, lang: string, theme: string) => {
    try {
      const html = await codeToHtml(code, {
        lang: lang as BundledLanguage,
        theme,
      }).then((html) =>
        // Add a trailing <br> to prevent the last empty line from collapsing
        // This ensures the textarea and highlighted code stay in sync
        html.replace(/<\/code><\/pre>$/, "<br /></code></pre>"),
      );
      this.setHtml(html);
    } catch {
      // Fallback to escaped plain text if highlighting fails
      this.setHtml(
        `<pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}<br /></code></pre>`,
      );
    }
  };

  /**
   * Update code and trigger re-highlight
   */
  updateCode = (code: string) => {
    this.setState((prev) => ({ ...prev, code }));

    // Debounce highlighting
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
    }
    this.highlightTimeout = setTimeout(() => {
      const { lang, theme } = this.getSnapshot();
      void this.highlight(code, lang, theme);
    }, 50);
  };

  /**
   * Update language and trigger re-highlight
   */
  setLang = (lang: string) => {
    this.setState((prev) => ({ ...prev, lang }));
  };

  /**
   * Update highlighted HTML
   */
  setHtml = (html: string) => {
    this.setState((prev) => ({ ...prev, html }));
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
  const { state, store } = useStore<CodeBlockState, CodeBlockStore>(
    new CodeBlockStore({ blockId }),
  );

  // Re-highlight when language changes
  useEffect(() => {
    void store.highlight(state.code, state.lang, state.theme);
  }, [store, state.lang, state.theme, state.code]);

  const ctx = useMemo(() => ({ state, store }), [state, store]);

  return <CodeBlockContext value={ctx}>{children}</CodeBlockContext>;
}
