/*************************************************************************/
/*  Table.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { PropsWithChildren } from 'react'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import cn from '../../utils/classNamesMerge'
// eslint-disable-next-line import/no-cycle
import TableCollapsibleRow from './TableCollapsibleRow'
import TableActionsDropdownToggle from './TableActionsDropdownToggle'
import TableActionButton from './TableActionButton'
import TableSortAndFilterHeaderCell from './KeyValueSearch/TableSortAndFilterHeaderCell'
// eslint-disable-next-line import/no-cycle
import { TableSelectAllHeaderCell, TableSelectDataCell } from './TableSelect'

export type TableProps = {
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLDivElement>>

function TableRoot({ className, children, ...props } : TableProps) {
  return (
    <div className={cn('w-full shadow-light rounded-sm overflow-x-auto overflow-y-hidden', className)} {...props}>
      <table className="min-w-full divide-y bg-surface-100 divide-border-secondary">
        {children}
      </table>
    </div>
  )
}

export type TableHeaderProps = {
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableSectionElement>>

function TableHeader({ className, children, ...props } : TableHeaderProps) {
  return (
    <thead className={cn('bg-surface-200/50 border-b border-border', className)} {...props}>
      {children}
    </thead>
  )
}

export type TableHeaderCellProps = {
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableCellElement>>

function TableHeaderCell({ className, children, ...props } : TableHeaderCellProps) {
  return (
    <th
      scope="col"
      className={cn('ps-3 py-3.5 text-left font-semibold text-secondary', className)}
      {...props}
    >
      {children}
    </th>
  )
}

export type TableHeaderRowProps = {
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableRowElement>>

function TableHeaderRow({ className, children, ...props } : TableHeaderRowProps) {
  return (
    <tr className={cn('cursor-default', className)} {...props}>
      {children}
    </tr>
  )
}

export type TableBodyProps = {
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableSectionElement>>

function TableBody({ className, children, ...props } : TableBodyProps) {
  return (
    <tbody
      className={cn(
        'divide-y divide-border/50',
        className,
      )}
      {...props}
    >
      {children}
    </tbody>
  )
}

export type TableRowProps = {
  selected?: boolean;
  className?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableRowElement>>

function TableRow({
  selected, className, children, ...props
} : TableRowProps) {
  return (
    <tr
      className={cn(
        'hover:bg-surface-200/25 cursor-default text-foreground-secondary',
        selected && 'bg-surface-200/25',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

export type TableDataCellProps = {
  className?: string;
  alignItems?: 'right';
  maxWidth?: number;
  copyValue?: string;
} & PropsWithChildren<React.HTMLProps<HTMLTableCellElement>>

type EventType = React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>

function TableDataCell({
  className, children, alignItems, maxWidth, copyValue, ...props
} : TableDataCellProps) {
  function copyCellValue(e: EventType) {
    if (!copyValue) return
    e.stopPropagation()
    navigator.clipboard.writeText(copyValue)
    toast.info('Copied the value to the clipboard!')
  }
  return (
    <td
      {...props}
      className={cn(
        'whitespace-nowrap px-3 py-2 relative',
        alignItems === 'right' && 'flex items-end justify-end',
        maxWidth && 'overflow-hidden text-ellipsis',
        className,
      )}
      style={{ maxWidth: `${maxWidth}px`, width: `${maxWidth}px` }}
    >
      {children}
      {copyValue && (
      <div className="absolute inset-0 flex items-center justify-end group">
        <div
          className="flex items-center justify-center h-8 w-8 border border-border rounded bg-surface-100/75 text-sm invisible group-hover:visible cursor-pointer"
          onClick={copyCellValue}
          // For accessibility
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              copyCellValue(e)
            }
          }}
        >
          <FontAwesomeIcon icon={faCopy} />
        </div>
      </div>
      )}
    </td>
  )
}

const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  HeaderRow: TableHeaderRow,
  HeaderCell: TableHeaderCell,
  SelectAllHeaderCell: TableSelectAllHeaderCell,
  SortAndFilterHeaderCell: TableSortAndFilterHeaderCell,
  Body: TableBody,
  Row: TableRow,
  DataCell: TableDataCell,
  SelectDataCell: TableSelectDataCell,
  CollapsibleRow: TableCollapsibleRow,
  ActionsDropdownToggle: TableActionsDropdownToggle,
  ActionButton: TableActionButton,
})
export default Table
