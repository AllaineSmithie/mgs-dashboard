/*************************************************************************/
/*  Alert.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { PropsWithChildren } from 'react'
import cn from '../utils/classNamesMerge'

type AlertProps = {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  className?: string;
} & PropsWithChildren

export default function Alert({ children, variant = 'primary', className }: AlertProps) {
  let variantClasses = 'tw-bg-opacity-20 tw-text-opacity-80 tw-border-opacity-80 '
  if (variant === 'primary') {
    variantClasses += 'tw-bg-blue-800 tw-text-blue-800 tw-border-blue-800 '
    variantClasses += 'dark:tw-bg-opacity-20 dark:tw-bg-blue-500 dark:tw-text-blue-100 dark:tw-border-blue-500'
  }
  if (variant === 'secondary') {
    variantClasses += 'tw-bg-scale-800 tw-text-scale-800 tw-border-scale-800 '
    variantClasses += 'dark:tw-bg-opacity-20  dark:tw-bg-scale-500 dark:tw-text-scale-100 dark:tw-border-scale-500'
  }
  if (variant === 'success') {
    variantClasses += 'tw-bg-success-800 tw-text-success-800 tw-border-success-800 '
    variantClasses += 'dark:tw-bg-opacity-20  dark:tw-bg-success-500 dark:tw-text-success-100 dark:tw-border-success-500'
  }
  if (variant === 'danger') {
    variantClasses += 'tw-bg-danger-800 tw-text-danger-800 tw-border-danger-800 '
    variantClasses += 'dark:tw-bg-opacity-20  dark:tw-bg-danger-500 dark:tw-text-danger-100 dark:tw-border-danger-500'
  }
  if (variant === 'warning') {
    variantClasses += 'tw-bg-warning-800 tw-text-warning-800 tw-border-warning-800 '
    variantClasses += 'dark:tw-bg-opacity-20  dark:tw-bg-warning-500 dark:tw-text-warning-100 dark:tw-border-warning-500'
  }

  return (
    <div className={cn('tw-border tw-rounded-md tw-overflow-hidden tw-p-4', variantClasses, className)}>
      { children }
    </div>
  )
}
