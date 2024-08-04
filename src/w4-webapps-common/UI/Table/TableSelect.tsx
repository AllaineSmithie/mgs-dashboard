/*************************************************************************/
/*  TableSelect.tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faSquare, faSquareMinus } from '@fortawesome/free-regular-svg-icons'
import cn from '@webapps-common/utils/classNamesMerge'
// eslint-disable-next-line import/no-cycle
import Table, { TableDataCellProps, TableHeaderCellProps } from './Table'
import Tooltip from '../Tooltip'

export type TableSelectAllHeaderCellProps = {
  hoverText?: string;
  state: 'checked' | 'unchecked' | 'undetermined';
  onPressed?: () => void;
} & TableHeaderCellProps

export function TableSelectAllHeaderCell({
  hoverText = 'Select all',
  state,
  onPressed = () => {},
  className,
  ...props
} : TableSelectAllHeaderCellProps) {
  const icons = {
    checked: faCheckSquare,
    unchecked: faSquare,
    undetermined: faSquareMinus,
  }

  return (
    <Table.HeaderCell
      className={cn(className, 'cursor-pointer')}
      {...props}
      onClick={(e) => {
        onPressed()
        e.stopPropagation()
      }}
    >
      <Tooltip content={hoverText} disabled={!hoverText}>
        <FontAwesomeIcon icon={icons[state]} />
      </Tooltip>
    </Table.HeaderCell>
  )
}

export type TableSelectDataCellProps = {
  hoverText?: string;
  checked: boolean;
  onPressed?: () => void;
} & TableDataCellProps

export function TableSelectDataCell({
  hoverText = '',
  checked,
  onPressed = () => {},
  className,
  ...props
} : TableSelectDataCellProps) {
  return (
    <Table.DataCell
      className={cn(className, 'w-10 cursor-pointer')}
      {...props}
      onClick={(e) => {
        onPressed()
        e.stopPropagation()
      }}
    >
      <Tooltip content={hoverText} disabled={!hoverText}>
        <FontAwesomeIcon icon={checked ? faCheckSquare : faSquare} />
      </Tooltip>
    </Table.DataCell>
  )
}
