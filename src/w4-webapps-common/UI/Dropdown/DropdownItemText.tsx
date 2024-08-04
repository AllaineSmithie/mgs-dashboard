/*************************************************************************/
/*  DropdownItemText.tsx                                                 */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import cn from '../../utils/classNamesMerge'

type HeaderProps = {
  className?: string;
} & React.PropsWithChildren

export default function DropdownItemText({ children, className }:HeaderProps) {
  return (
    <div className={cn('py-2 px-4 text-scale-600 dark:text-scale-400', className)}>
      {children}
    </div>
  )
}
