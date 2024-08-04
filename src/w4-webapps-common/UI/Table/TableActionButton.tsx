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
        'rounded bg-transparent text-scale-700 dark:text-scale-300 flex w-9 h-9  border-border-secondary hover:bg-scale-300/50 dark:hover:text-white dark:hover:bg-scale-800 items-center justify-center',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
