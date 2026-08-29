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
  autoFocus?: boolean;
  restoreInvalidValueOnBlur?: boolean;
  reconcileCommittedValue?: boolean;
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

interface InputFieldState {
  initialValue: string;
  value: string;
  error: boolean;
  pendingCommit: boolean;
}

export function useInputField({
  id,
  initialValue,
  validate = () => true,
  onUpdate,
  onKeyDownUpdate,
  autoFocus = true,
  restoreInvalidValueOnBlur = false,
  reconcileCommittedValue = false,
}: UseInputFieldOptions): UseInputFieldResults {
  const ref = useRef<HTMLInputElement>(null);
  const [field, setField] = useState<InputFieldState>(() => ({
    initialValue,
    value: initialValue,
    error: false,
    pendingCommit: false,
  }));

  if (
    field.initialValue !== initialValue ||
    (reconcileCommittedValue && field.pendingCommit)
  ) {
    setField({
      initialValue,
      value: initialValue,
      error: false,
      pendingCommit: false,
    });
  }

  const { value, error } = field;

  const commit = useCallback(() => {
    if (error || value === initialValue) return;
    onUpdate?.(value);
    if (reconcileCommittedValue) {
      setField((current) => ({ ...current, pendingCommit: true }));
    }
  }, [error, initialValue, onUpdate, reconcileCommittedValue, value]);

  const props = useMemo<UseInputFieldResults["props"]>(
    () => ({
      ref,
      id,
      value,
      "aria-invalid": error,
      onChange: (e) => {
        e.preventDefault();
        const nextValue = e.target.value;
        setField((current) => ({
          ...current,
          value: nextValue,
          error: !validate(nextValue),
        }));
      },
      onBlur: () => {
        if (error) {
          if (restoreInvalidValueOnBlur) {
            setField((current) => ({
              ...current,
              value: initialValue,
              error: false,
            }));
          }
          return;
        }
        commit();
      },
      onKeyDown: (e) => {
        e.stopPropagation();
        if (e.key !== "Enter" || value === initialValue) return;
        commit();
        onKeyDownUpdate?.();
      },
    }),
    [
      commit,
      error,
      id,
      initialValue,
      onKeyDownUpdate,
      restoreInvalidValueOnBlur,
      validate,
      value,
    ],
  );

  const reset = useCallback(() => {
    setField((current) => ({
      ...current,
      value: initialValue,
      error: false,
      pendingCommit: false,
    }));
  }, [initialValue]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return { error, ref, props, reset };
}
