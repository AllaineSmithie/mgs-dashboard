/*************************************************************************/
/*  Badge.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { PropsWithChildren } from 'react'
import cn from '../utils/classNamesMerge'

type BadgeProps = {
  bg?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  className?: string;
} & PropsWithChildren

export default function Badge({ children, bg = 'primary', className }: BadgeProps) {
  let variantClasses = ''
  if (bg === 'primary') {
    variantClasses += 'bg-brand-500 text-brand-100'
  }
  if (bg === 'secondary') {
    variantClasses += 'bg-scale-500 text-scale-100'
  }
  if (bg === 'success') {
    variantClasses += 'bg-success-500 text-success-100'
  }
  if (bg === 'danger') {
    variantClasses += 'bg-danger-500 text-danger-50'
  }
  if (bg === 'warning') {
    variantClasses += 'bg-warning-500 text-warning-50'
  }
  return (
    <div className={cn('px-2 py-1 overflow-hidden rounded-full text-center inline-block text-xs font-bold', variantClasses, className)}>
      { children }
    </div>
  )
}
