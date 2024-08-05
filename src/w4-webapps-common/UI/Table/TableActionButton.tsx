/*************************************************************************/
/*  TableActionButton.tsx                                                */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import cn from '../../utils/classNamesMerge'

export default function TableActionButton(
  { className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      className={cn(
        'tw-rounded tw-bg-transparent tw-text-scale-700 dark:tw-text-scale-300 tw-flex tw-w-9 tw-h-9  tw-border-border-secondary hover:tw-bg-scale-300/50 dark:hover:tw-text-white dark:hover:tw-bg-scale-800 tw-items-center tw-justify-center',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
