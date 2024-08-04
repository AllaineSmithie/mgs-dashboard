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
  let variantClasses = 'bg-opacity-20 text-opacity-80 border-opacity-80 '
  if (variant === 'primary') {
    variantClasses += 'bg-blue-800 text-blue-800 border-blue-800 '
    variantClasses += 'dark:bg-opacity-20 dark:bg-blue-500 dark:text-blue-100 dark:border-blue-500'
  }
  if (variant === 'secondary') {
    variantClasses += 'bg-scale-800 text-scale-800 border-scale-800 '
    variantClasses += 'dark:bg-opacity-20  dark:bg-scale-500 dark:text-scale-100 dark:border-scale-500'
  }
  if (variant === 'success') {
    variantClasses += 'bg-success-800 text-success-800 border-success-800 '
    variantClasses += 'dark:bg-opacity-20  dark:bg-success-500 dark:text-success-100 dark:border-success-500'
  }
  if (variant === 'danger') {
    variantClasses += 'bg-danger-800 text-danger-800 border-danger-800 '
    variantClasses += 'dark:bg-opacity-20  dark:bg-danger-500 dark:text-danger-100 dark:border-danger-500'
  }
  if (variant === 'warning') {
    variantClasses += 'bg-warning-800 text-warning-800 border-warning-800 '
    variantClasses += 'dark:bg-opacity-20  dark:bg-warning-500 dark:text-warning-100 dark:border-warning-500'
  }

  return (
    <div className={cn('border rounded-md overflow-hidden p-4', variantClasses, className)}>
      { children }
    </div>
  )
}
