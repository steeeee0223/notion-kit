"use client";

import React, { createContext, use, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "usehooks-ts";

export interface ModalContextInterface {
  isOpen: boolean;
  openModal: (modal: React.ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextInterface | null>(null);

export function useModal() {
  const object = use(ModalContext);
  if (!object)
    throw new Error("`useModal` must be used within `ModalProvider`");
  return object;
}

export type ModalProviderProps = React.PropsWithChildren;

export function ModalProvider({ children }: ModalProviderProps) {
  const isMounted = useIsMounted();
  const [isOpen, setIsOpen] = useState(false);
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null);

  const contextValue = useMemo<ModalContextInterface>(
    () => ({
      isOpen,
      openModal: (modal) => {
        if (!modal) return;
        setShowingModal(modal);
        setIsOpen(true);
      },
      closeModal: () => {
        setShowingModal(null);
        setIsOpen(false);
      },
    }),
    [isOpen],
  );

  if (!isMounted()) return null;
  return (
    <ModalContext value={contextValue}>
      {children}
      {isOpen && createPortal(showingModal, document.body)}
    </ModalContext>
  );
}
