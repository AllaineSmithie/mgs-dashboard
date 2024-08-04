/*************************************************************************/
/*  ModalContext.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { PropsWithChildren } from 'react'
import { createContext, useContext, useState } from 'react'

type ModalContextType = {
  isModalOpen: (name: string) => boolean;
  toggleModal: (modalName: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export default function ModalProvider({ children }: PropsWithChildren) {
  const [modal, setModal] = useState<string>('test-modal')

  function toggleModal(modalName: string) {
    setModal((prevModal) => (prevModal === modalName ? '' : modalName))
  }

  function closeModal() {
    setModal('')
  }

  function isModalOpen(modalName: string): boolean {
    return modal === modalName
  }

  return (
    // ESLint warns that we should use useMemo to avoid extra rerenders here, but it's not necessary
    // The performance impact would be negligible, and I don't want to add extra complexity.
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <ModalContext.Provider value={{ toggleModal, closeModal, isModalOpen }}>
      {children}
    </ModalContext.Provider>
  )
}
