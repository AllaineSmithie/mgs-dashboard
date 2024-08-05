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
            'tw-fixed tw-inset-0 tw-z-[10000] tw-flex tw-items-start tw-justify-center',
          )}
        >
          {/* Scrollable wrapper around the card */}
          <div className="tw-flex tw-items-start md:tw-py-8 tw-justify-center tw-absolute tw-inset-0 tw-overflow-y-auto tw-z-10 ">
            {/* Modal card */}
            <div
              className={cn(
                'tw-bg-background md:tw-rounded-lg tw-shadow-md md:tw-max-w-md tw-w-full ',
                size === 'medium' && 'md:tw-max-w-3xl',
                size === 'wide' && 'md:tw-max-w-3xl',
                className,
              )}
            >
              {children}
            </div>
          </div>
          {/* Modal background */}
          <div
            className="tw-absolute tw-inset-0 tw-bg-black tw-opacity-50"
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
        'tw-flex tw-justify-between tw-items-center tw-p-4 tw-relative tw-border-b tw-border-border-secondary dark:tw-border-border',
        className,
      )}
    >
      {children}
      {closeButton && (
        <button
          type="button"
          className="close-button tw-text-foreground-secondary tw-bg-transparent hover:tw-text-scale-500"
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
    <h1 className={cn('tw-text-2xl tw-font-medium', className)}>{children}</h1>
  )
}

type BodyProps = {
  className?: string;
} & PropsWithChildren

function Body({ children, className }: BodyProps) {
  return <div className={cn('tw-p-4', className)}>{children}</div>
}

type FooterProps = {
  className?: string;
} & PropsWithChildren

function Footer({ children, className }: FooterProps) {
  return (
    <div
      className={cn(
        'tw-flex tw-gap-2 tw-justify-end tw-p-4 tw-border-t tw-border-border-secondary dark:tw-border-border',
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
