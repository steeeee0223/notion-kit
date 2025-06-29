"use client";

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const openModalFn = useRef((modal: React.ReactNode) => {
    if (!modal) return;
    setShowingModal(modal);
    setIsOpen(true);
  });
  const closeModalFn = useRef(() => {
    setShowingModal(null);
    setIsOpen(false);
  });

  const contextValue = useMemo<ModalContextInterface>(
    () => ({
      isOpen,
      openModal: openModalFn.current,
      closeModal: closeModalFn.current,
    }),
    [isOpen],
  );

  if (!isMounted) return null;
  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {isOpen && createPortal(showingModal, document.body)}
    </ModalContext.Provider>
  );
}
