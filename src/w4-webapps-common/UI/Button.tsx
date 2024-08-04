/*************************************************************************/
/*  Button.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import cn from '../utils/classNamesMerge'

export type ButtonProps = {
  type?: 'submit' | 'reset' | 'button';
  variant?: 'primary' | 'secondary' | 'outline-secondary' | 'no-background';
} & ButtonHTMLAttributes<HTMLButtonElement>

// eslint-disable-next-line react/display-name
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  type = 'button',
  className = '',
  variant = 'primary',
  disabled,
  ...props
}, ref) => {
  let buttonStyles = `
    text-sm font-semibold
    inline-flex relative gap-2 items-center justify-center
    whitespace-nowrap
    rounded-md px-3.5 py-2.5
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
  `

  if (variant === 'primary') {
    buttonStyles += 'bg-brand-500 text-white '
    if (disabled) {
      buttonStyles += 'bg-brand-700 text-scale-400 '
    } else {
      buttonStyles += 'hover:bg-brand-600 '
    }
  } else if (variant === 'secondary') {
    buttonStyles += `
      bg-white dark:bg-scale-700
      text-foreground-secondary

      shadow-sm ring-1 ring-inset ring-scale-300
      dark:ring-0
    `
    if (disabled) {
      buttonStyles += `
        bg-scale-200 dark:bg-scale-700
        text-scale-400 dark:text-scale-500
      `
    } else {
      buttonStyles += `
        hover:bg-scale-200 dark:hover:bg-scale-600
      `
    }
  } else if (variant === 'outline-secondary') {
    buttonStyles += `
      bg-transparent dark:bg-scale-700/50
      text-scale-900 dark:text-scale-300

      border outline-scale-300
      shadow-sm border-border-secondary dark:border-border

      hover:bg-scale-100 dark:hover:bg-scale-600
    `
  } else if (variant === 'no-background') {
    buttonStyles += `
      bg-transparent dark:bg-transparent
      text-scale-900 dark:text-scale-300
      hover:text-scale-700 dark:hover:text-scale-50
    `
  }

  buttonStyles = cn(buttonStyles)
  return (
    <button
      // eslint-disable-next-line react/button-has-type
      type={type}
      disabled={disabled}
      className={cn(buttonStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
