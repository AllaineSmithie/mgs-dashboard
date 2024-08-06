/*************************************************************************/
/*  Table.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { PropsWithChildren } from 'react'
import cn from '../../utils/classNamesMerge'
// eslint-disable-next-line import/no-cycle
import TableCollapsibleRow from './TableCollapsibleRow'
import TableActionsDropdownToggle from './TableActionsDropdownToggle'
import TableActionButton from './TableActionButton'
import TableFilterCell from './SearchAndFilter/TableFilterCell'

type TableProps = {
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLDivElement>>

function TableRoot({ className, children, ...props } : TableProps) {
  return (
    <div className={cn('tw-w-full tw-shadow-light tw-rounded-sm', className)} {...props}>
      <table className="tw-min-w-full tw-divide-y tw-bg-surface-100 tw-divide-border-secondary">
        {children}
      </table>
    </div>
  )
}

type TableHeaderProps = {
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableSectionElement>>

function TableHeader({ className, children, ...props } : TableHeaderProps) {
  return (
    <thead className={cn('tw-bg-surface-200/50 tw-border-b tw-border-border', className)} {...props}>
      {children}
    </thead>
  )
}

type TableHeaderCellProps = {
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableCellElement>>

function TableHeaderCell({ className, children, ...props } : TableHeaderCellProps) {
  return (
    <th
      scope="col"
      className={cn('tw-px-3 tw-py-3.5 tw-text-left tw-font-semibold tw-text-secondary', className)}
      {...props}
    >
      {children}
    </th>
  )
}

type TableHeaderRowProps = {
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableRowElement>>

function TableHeaderRow({ className, children, ...props } : TableHeaderRowProps) {
  return (
    <tr className={cn('tw-cursor-default', className)} {...props}>
      {children}
    </tr>
  )
}

type TableBodyProps = {
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableSectionElement>>

function TableBody({ className, children, ...props } : TableBodyProps) {
  return (
    <tbody
      className={cn(
        'tw-divide-y tw-divide-border/50',
        className,
      )}
      {...props}
    >
      {children}
    </tbody>
  )
}

type TableRowProps = {
  selected?: boolean;
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableRowElement>>

function TableRow({
  selected, className, children, ...props
} : TableRowProps) {
  return (
    <tr
      className={cn(
        'hover:tw-bg-surface-200/25 tw-cursor-default tw-text-foreground-secondary',
        selected && 'tw-bg-surface-200/25',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

type TableDataCellProps = {
  className?: string;
  alignItems?: 'right';
} & PropsWithChildren<React.HTMLProps<HTMLTableCellElement>>

function TableDataCell({
  className, children, alignItems, ...props
} : TableDataCellProps) {
  return (
    <td
      {...props}
      className={cn(
        'tw-whitespace-nowrap tw-px-3 tw-py-2',
        alignItems === 'right' && 'tw-flex tw-items-end tw-justify-end',
        className,
      )}
    >
      {children}
    </td>
  )
}

const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  HeaderRow: TableHeaderRow,
  HeaderCell: TableHeaderCell,
  FilterCell: TableFilterCell,
  Body: TableBody,
  Row: TableRow,
  DataCell: TableDataCell,
  CollapsibleRow: TableCollapsibleRow,
  ActionsDropdownToggle: TableActionsDropdownToggle,
  ActionButton: TableActionButton,
})
export default Table
