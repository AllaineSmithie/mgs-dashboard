/*************************************************************************/
/*  DropdownHeader.tsx                                                   */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import cn from '../../utils/classNamesMerge'

type HeaderProps = {
  className?: string;
} & React.PropsWithChildren

export default function DropdownHeader({ children, className }:HeaderProps) {
  return (
    <div className={cn('tw-py-2 tw-px-4 tw-text-sm tw-text-scale-600 dark:tw-text-scale-400', className)}>
      {children}
    </div>
  )
}
