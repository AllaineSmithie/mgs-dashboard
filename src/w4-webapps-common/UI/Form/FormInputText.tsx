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
        'tw-flex',
        'tw-rounded-md tw-py-1 tw-px-2',
        'tw-border-[1px] tw-border-scale-600 dark:tw-border-border',
        'tw-bg-scale-700',
        'tw-items-center tw-justify-center',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
