"use client";

import * as React from "react";

import {
  createDomSelector,
  type DomSelection,
  type DomSelectorController,
} from "./core";

interface DomSelectorProps {
  active?: boolean;
  defaultActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  onSelect?: (selection: DomSelection) => void;
  onCancel?: () => void;
}

function DomSelector({
  active: activeProp,
  defaultActive = false,
  onActiveChange,
  onSelect,
  onCancel,
}: DomSelectorProps) {
  const [uncontrolledActive, setUncontrolledActive] =
    React.useState(defaultActive);
  const active = activeProp ?? uncontrolledActive;
  const controlled = activeProp !== undefined;
  const controllerRef = React.useRef<DomSelectorController>(null);
  const callbacksRef = React.useRef({ onActiveChange, onSelect, onCancel });

  React.useEffect(() => {
    callbacksRef.current = { onActiveChange, onSelect, onCancel };
  }, [onActiveChange, onCancel, onSelect]);

  React.useEffect(() => {
    const setActive = (nextActive: boolean) => {
      if (!controlled) setUncontrolledActive(nextActive);
      callbacksRef.current.onActiveChange?.(nextActive);
    };
    const controller = createDomSelector({
      onSelect(selection) {
        setActive(false);
        callbacksRef.current.onSelect?.(selection);
      },
      onCancel() {
        setActive(false);
        callbacksRef.current.onCancel?.();
      },
    });
    controllerRef.current = controller;

    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [controlled]);

  React.useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (active) controller.start();
    else controller.stop();
  }, [active]);

  return null;
}

export { DomSelector };
export type { DomSelectorProps };
