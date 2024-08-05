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
    classNames = cn(classNames, 'tw-h-12 tw-w-12 tw-border-8')
  }
  return (
    <div className="tw-inline-flex tw-items-center tw-justify-center">
      <div
        className={cn(
          'tw-h-5 tw-w-5 tw-animate-spin tw-rounded-full tw-border-4 tw-border-border/10 tw-border-t-scale-800/80 dark:tw-border-border/30 dark:tw-border-t-scale-100',
          light && 'tw-border-border-secondary/50 tw-border-t-scale-300',
          classNames,
          className,
        )}
      />
      <span className="tw-invisible tw-absolute tw-inset-0">Loading...</span>
    </div>
  )
}
