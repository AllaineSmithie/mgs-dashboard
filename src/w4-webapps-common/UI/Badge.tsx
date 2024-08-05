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
    variantClasses += 'tw-bg-brand-500 tw-text-brand-100'
  }
  if (bg === 'secondary') {
    variantClasses += 'tw-bg-scale-500 tw-text-scale-100'
  }
  if (bg === 'success') {
    variantClasses += 'tw-bg-success-500 tw-text-success-100'
  }
  if (bg === 'danger') {
    variantClasses += 'tw-bg-danger-500 tw-text-danger-50'
  }
  if (bg === 'warning') {
    variantClasses += 'tw-bg-warning-500 tw-text-warning-50'
  }
  return (
    <div className={cn('tw-px-2 tw-py-1 tw-overflow-hidden tw-rounded-full tw-inline-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold tw-gap-2', variantClasses, className)}>
      { children }
    </div>
  )
}
