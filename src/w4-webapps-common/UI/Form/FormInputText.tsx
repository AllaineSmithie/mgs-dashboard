/*************************************************************************/
/*  FormInputText.tsx                                                    */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import cn from '../../utils/classNamesMerge'

export default function FormInputText({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'flex',
        'rounded-md py-1 px-2',
        'border-[1px] border-scale-600 dark:border-border',
        'bg-scale-700',
        'items-center justify-center',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
