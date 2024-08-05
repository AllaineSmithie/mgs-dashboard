/*************************************************************************/
/*  FormFeedback.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { PropsWithChildren } from 'react'
import cn from '../../utils/classNamesMerge'
import { useFormGroup } from './FormGroup'

type FeedbackProps = {
  className?: string;
  type?: 'invalid';
} & PropsWithChildren

export default function FormFeedback({ children, className, type }: FeedbackProps) {
  const { isInvalid } = useFormGroup()

  if (!isInvalid) return null

  let classNames = 'tw-text-sm tw-text-foreground-muted'
  if (type === 'invalid') {
    classNames = cn(classNames, 'tw-text-danger-600 dark:tw-text-danger-400')
  }
  return <div className={cn(classNames, className)}>{children}</div>
}
