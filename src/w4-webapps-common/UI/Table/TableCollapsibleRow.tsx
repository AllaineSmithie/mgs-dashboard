/*************************************************************************/
/*  TableCollapsibleRow.tsx                                              */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { PropsWithChildren } from 'react'
import Collapse from '../Collapse'
import cn from '../../utils/classNamesMerge'

export type CollapsibleRowProps = {
  colCount?: number;
  expanded?: boolean;
  id?: string;
  className?: string;
} & PropsWithChildren

export default function TableCollapsibleRow({
  children,
  colCount,
  expanded = true,
  id,
  className,
}: CollapsibleRowProps) {
  return (
    <tr className={cn('', className)}>
      <td colSpan={colCount} className="p-0 m-0">
        <Collapse show={expanded}>
          <div id={id}>{children}</div>
        </Collapse>
      </td>
    </tr>
  )
}
