/*************************************************************************/
/*  Modal.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { PropsWithChildren } from 'react'
import { createContext, useContext, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import cn from '../utils/classNamesMerge'
import Portal from './Portal'

// Note: This is entirely unrelated to context defined in ModalContext.tsx
// ModalContext.tsx is for the global modal state managed across the app.
// But this context is only used for this modal, to be able to pass the onHide function to Header.
type ModalContextType = {
  onHide: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export type ModalProps = {
  show?: boolean;
  onHide?: () => void;
  size?: 'narrow' | 'medium' | 'wide';
  className?: string;
  backdrop?: 'static';
} & PropsWithChildren

function ModalRoot({
  children,
  show = false,
  onHide = () => {},
  size = 'narrow',
  className = '',
  backdrop,
}: ModalProps) {
  useEffect(() => {
    if (show) {
      lockBodyScroll()
    }
    return () => {
      unlockBodyScroll()
    }
  }, [show])
  if (!show) return null
  return (
    <Portal>
      {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
      <ModalContext.Provider value={{ onHide }}>
        {/* Modal wrapper */}
        <div
          className={cn(
            'fixed inset-0 z-[10000] flex items-start justify-center',
          )}
        >
          {/* Scrollable wrapper around the card */}
          <div className="flex items-start md:py-8 justify-center absolute inset-0 overflow-y-auto z-10 ">
            {/* Modal card */}
            <div
              className={cn(
                'bg-background md:rounded-lg shadow-md md:max-w-md w-full ',
                size === 'medium' && 'md:max-w-3xl',
                size === 'wide' && 'md:max-w-3xl',
                className,
              )}
            >
              {children}
            </div>
          </div>
          {/* Modal background */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            role="presentation"
            onClick={() => {
              if (backdrop !== 'static') {
                onHide()
              }
            }}
          />
        </div>
      </ModalContext.Provider>
    </Portal>
  )
}

type HeaderProps = {
  className?: string;
  closeButton?: boolean;
} & PropsWithChildren

function Header({ children, className, closeButton }: HeaderProps) {
  const { onHide } = useContext(ModalContext) as ModalContextType
  return (
    <div
      className={cn(
        'flex justify-between items-center p-4 relative border-b border-border-secondary dark:border-border',
        className,
      )}
    >
      {children}
      {closeButton && (
        <button
          type="button"
          className="close-button text-foreground-secondary bg-transparent hover:text-scale-500"
          onClick={onHide}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  )
}

type TitleProps = {
  className?: string;
} & PropsWithChildren

function Title({ children, className }: TitleProps) {
  return (
    <h1 className={cn('text-2xl font-medium', className)}>{children}</h1>
  )
}

type BodyProps = {
  className?: string;
} & PropsWithChildren

function Body({ children, className }: BodyProps) {
  return <div className={cn('p-4', className)}>{children}</div>
}

type FooterProps = {
  className?: string;
} & PropsWithChildren

function Footer({ children, className }: FooterProps) {
  return (
    <div
      className={cn(
        'flex gap-2 justify-end p-4 border-t border-border-secondary dark:border-border',
        className,
      )}
    >
      {children}
    </div>
  )
}

// Prevent scrolling on the body when the modal is open.
const lockBodyScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockBodyScroll = () => {
  document.body.style.overflow = ''
}

const Modal = Object.assign(ModalRoot, {
  Header,
  Title,
  Body,
  Footer,
})
export default Modal
