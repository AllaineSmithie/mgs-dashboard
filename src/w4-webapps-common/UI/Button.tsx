/*************************************************************************/
/*  Button.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { ButtonHTMLAttributes } from 'react'
import cn from '../utils/classNamesMerge'

export type ButtonProps = {
  type?: 'submit' | 'reset' | 'button';
  variant?: 'primary' | 'secondary' | 'outline-secondary' | 'no-background';
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  children,
  type = 'button',
  className = '',
  variant = 'primary',
  disabled,
  ...props
}: ButtonProps) {
  let buttonStyles = `
    tw-text-sm tw-font-semibold
    tw-inline-flex tw-relative tw-gap-2 tw-items-center tw-justify-center
    tw-whitespace-nowrap
    tw-rounded-md tw-px-3.5 tw-py-2.5
    focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600
  `

  if (variant === 'primary') {
    buttonStyles += 'tw-bg-brand-500 tw-text-white '
    if (disabled) {
      buttonStyles += 'tw-bg-brand-700 tw-text-scale-400 '
    } else {
      buttonStyles += 'hover:tw-bg-brand-600 '
    }
  } else if (variant === 'secondary') {
    buttonStyles += `
      tw-bg-white dark:tw-bg-scale-700
      tw-text-foreground-secondary

      tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-scale-300
      dark:tw-ring-0
    `
    if (disabled) {
      buttonStyles += `
        tw-bg-scale-200 dark:tw-bg-scale-700
        tw-text-scale-400 dark:tw-text-scale-500
      `
    } else {
      buttonStyles += `
        hover:tw-bg-scale-200 dark:hover:tw-bg-scale-600
      `
    }
  } else if (variant === 'outline-secondary') {
    buttonStyles += `
      tw-bg-transparent dark:tw-bg-scale-700/50
      tw-text-scale-900 dark:tw-text-scale-300

      tw-border tw-outline-scale-300
      tw-shadow-sm tw-border-border-secondary dark:tw-border-border

      hover:tw-bg-scale-100 dark:hover:tw-bg-scale-600
    `
  } else if (variant === 'no-background') {
    buttonStyles += `
      tw-bg-transparent dark:tw-bg-transparent
      tw-text-scale-900 dark:tw-text-scale-300
      hover:tw-text-scale-700 dark:hover:tw-text-scale-50
    `
  }

  buttonStyles = cn(buttonStyles)
  return (
    <button
      // eslint-disable-next-line react/button-has-type
      type={type}
      disabled={disabled}
      className={cn(buttonStyles, className)}
      {...props}
    >
      {children}
    </button>
  )
}
