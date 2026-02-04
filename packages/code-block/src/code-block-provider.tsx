import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";

import { Store, useStore } from "@notion-kit/hooks";

/** Public state that can be controlled externally */
export interface CodeBlockValue {
  /** The source code content */
  code: string;
  /** Programming language for syntax highlighting */
  lang: string;
  /** Color theme for syntax highlighting */
  theme?: string;
  /** Optional caption text (HTML supported) */
  caption?: string;
}

/** Internal state including derived values */
export interface CodeBlockState extends CodeBlockValue {
  blockId: string;
  /** Highlighted HTML output */
  html: string;
  theme: string;
}

interface CodeBlockActions {
  setCaption: (caption?: string) => void;
  updateCode: (code: string) => void;
  setLang: (lang: string) => void;
}

class CodeBlockStore extends Store<CodeBlockState> implements CodeBlockActions {
  private highlightTimeout: NodeJS.Timeout | null = null;
  private onChange?: (value: CodeBlockValue) => void;

  constructor(
    initialState?: Partial<CodeBlockState>,
    onChange?: (value: CodeBlockValue) => void,
  ) {
    super({
      blockId: "",
      code: "",
      lang: "text",
      theme: "github-dark",
      html: "",
      ...initialState,
    });
    this.onChange = onChange;
  }

  /** Notify external onChange handler */
  private notifyChange = () => {
    if (this.onChange) {
      const { code, lang, theme, caption } = this.getSnapshot();
      this.onChange({ code, lang, theme, caption });
    }
  };

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

  /** Update code and trigger re-highlight */
  updateCode = (code: string) => {
    this.setState((v) => ({ ...v, code }));
    this.notifyChange();

    // Debounce highlighting
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
    }
    this.highlightTimeout = setTimeout(() => {
      const { lang, theme } = this.getSnapshot();
      void this.highlight(code, lang, theme);
    }, 50);
  };

  setLang = (lang: string) => {
    this.setState((v) => ({ ...v, lang }));
    this.notifyChange();
    // Trigger re-highlight with new language
    const { code, theme } = this.getSnapshot();
    void this.highlight(code, lang, theme);
  };

  setHtml = (html: string) => {
    this.setState((v) => ({ ...v, html }));
  };

  setTheme = (theme: string) => {
    this.setState((v) => ({ ...v, theme }));
    this.notifyChange();
    // Trigger re-highlight with new theme
    const { code, lang } = this.getSnapshot();
    void this.highlight(code, lang, theme);
  };

  setCaption = (caption?: string) => {
    this.setState((v) => ({ ...v, caption }));
    this.notifyChange();
  };

  enableCaption = () => {
    const { caption } = this.getSnapshot();
    if (caption === undefined) {
      this.setState((v) => ({ ...v, caption: "" }));
      this.notifyChange();
      // Use setTimeout to allow the caption textarea to render first
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent("code-block:focus-caption"));
      }, 0);
    }
  };

  /** Sync external controlled value to internal state */
  syncFromExternal = (value: Partial<CodeBlockValue>) => {
    const current = this.getSnapshot();
    const updates: Partial<CodeBlockState> = {};
    let needsHighlight = false;

    if (value.code !== undefined && value.code !== current.code) {
      updates.code = value.code;
      needsHighlight = true;
    }
    if (value.lang !== undefined && value.lang !== current.lang) {
      updates.lang = value.lang;
      needsHighlight = true;
    }
    if (value.theme !== undefined && value.theme !== current.theme) {
      updates.theme = value.theme;
      needsHighlight = true;
    }
    if (value.caption !== undefined && value.caption !== current.caption) {
      updates.caption = value.caption;
    }

    if (Object.keys(updates).length > 0) {
      this.setState((v) => ({ ...v, ...updates }));
    }

    if (needsHighlight) {
      const newState = { ...current, ...updates };
      void this.highlight(newState.code, newState.lang, newState.theme);
    }
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

export interface CodeBlockProviderProps extends React.PropsWithChildren {
  /** Controlled value - when provided, component becomes controlled */
  value?: CodeBlockValue;
  /** Default value for uncontrolled mode */
  defaultValue?: Partial<CodeBlockValue>;
  /** Callback when value changes (for controlled mode) */
  onChange?: (value: CodeBlockValue) => void;
}

export function CodeBlockProvider({
  children,
  value,
  defaultValue,
  onChange,
}: CodeBlockProviderProps) {
  const blockId = useId();
  const isControlled = value !== undefined;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Stable onChange callback
  const handleChange = useCallback((newValue: CodeBlockValue) => {
    onChangeRef.current?.(newValue);
  }, []);

  // Create store with initial state
  const storeRef = useRef<CodeBlockStore | null>(null);
  storeRef.current ??= new CodeBlockStore(
    {
      blockId,
      code: value?.code ?? defaultValue?.code ?? "",
      lang: value?.lang ?? defaultValue?.lang ?? "text",
      theme: value?.theme ?? defaultValue?.theme ?? "github-dark",
      caption: value?.caption ?? defaultValue?.caption,
    },
    isControlled ? handleChange : undefined,
  );

  const { state, store } = useStore<CodeBlockState, CodeBlockStore>(
    storeRef.current,
  );

  // Sync controlled value to store
  useEffect(() => {
    if (isControlled) {
      store.syncFromExternal(value);
    }
  }, [isControlled, value, store]);

  // Re-highlight when language or theme changes (uncontrolled mode)
  useEffect(() => {
    if (!isControlled) {
      void store.highlight(state.code, state.lang, state.theme);
    }
  }, [isControlled, store, state.lang, state.theme, state.code]);

  const ctx = useMemo(() => ({ state, store }), [state, store]);

  return <CodeBlockContext value={ctx}>{children}</CodeBlockContext>;
}
