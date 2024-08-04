/*************************************************************************/
/*  Spinner.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import cn from '../utils/classNamesMerge'

type SpinnerProps = {
  large?: boolean;
  className?: string;
  light?: boolean;
}

export default function Spinner({ large = false, light = true, className = '' }: SpinnerProps) {
  let classNames = ''
  if (large) {
    classNames = cn(classNames, 'h-12 w-12 border-8')
  }
  return (
    <div className="inline-flex items-center justify-center">
      <div
        className={cn(
          'h-5 w-5 animate-spin rounded-full border-4 border-border/10 border-t-scale-800/80 dark:border-border/30 dark:border-t-scale-100',
          light && 'border-border-secondary/50 border-t-scale-300',
          classNames,
          className,
        )}
      />
      <span className="invisible absolute inset-0">Loading...</span>
    </div>
  )
}
