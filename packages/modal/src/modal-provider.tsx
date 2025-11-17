"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export interface ModalContextInterface {
  isOpen: boolean;
  openModal: (modal: React.ReactNode) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextInterface | null>(null);

export function useModal(): ModalContextInterface {
  const object = useContext(ModalContext);
  if (!object)
    throw new Error("`useModal` must be used within `ModalProvider`");
  return object;
}

export type ModalProviderProps = React.PropsWithChildren;

export function ModalProvider({ children }: ModalProviderProps) {
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

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {isOpen && createPortal(showingModal, document.body)}
    </ModalContext.Provider>
  );
}
