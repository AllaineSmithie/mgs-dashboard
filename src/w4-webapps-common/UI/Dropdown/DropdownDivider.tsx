/*************************************************************************/
/*  DropdownDivider.tsx                                                  */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import cn from '../../utils/classNamesMerge'

type DividerProps = {
  className?: string;
} & React.PropsWithChildren

export default function DropdownDivider({ children, className }:DividerProps) {
  return (
    <div className={cn('tw-border-t dark:tw-border-border', className)}>
      {children}
    </div>
  )
}
