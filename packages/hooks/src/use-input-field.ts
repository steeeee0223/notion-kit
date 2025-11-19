"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface UseInputFieldOptions {
  id: string;
  initialValue: string;
  validate?: (value: string) => boolean;
  onUpdate?: (value: string) => void;
  onKeyDownUpdate?: () => void;
}

interface UseInputFieldResults {
  error: boolean;
  props: Pick<
    React.ComponentProps<"input">,
    | "ref"
    | "id"
    | "value"
    | "onError"
    | "onChange"
    | "onBlur"
    | "onKeyDown"
    | "aria-invalid"
  >;
  ref: React.RefObject<HTMLInputElement | null>;
  reset: () => void;
}

export function useInputField({
  id,
  initialValue,
  validate = () => true,
  onUpdate,
  onKeyDownUpdate,
}: UseInputFieldOptions): UseInputFieldResults {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const props = useMemo<UseInputFieldResults["props"]>(
    () => ({
      ref,
      id,
      value,
      "aria-invalid": error,
      onChange: (e) => {
        e.preventDefault();
        setValue(e.target.value);
        const isValid = validate(e.target.value);
        setError(!isValid);
      },
      onBlur: () => {
        if (error || value === initialValue) return;
        onUpdate?.(value);
      },
      onKeyDown: (e) => {
        if (e.key !== "Enter" || value === initialValue) return;
        if (!error) onUpdate?.(value);
        onKeyDownUpdate?.();
      },
    }),
    [error, id, initialValue, onKeyDownUpdate, onUpdate, validate, value],
  );

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(false);
  }, [initialValue]);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return { error, ref, props, reset };
}
