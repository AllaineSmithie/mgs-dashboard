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
    <div className={cn('tw-w-full tw-shadow-light tw-rounded-sm', className)} {...props}>
      <table className="tw-min-w-full tw-divide-y tw-bg-surface-100 tw-divide-border-secondary">
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
    <thead className={cn('tw-bg-surface-200/50 tw-border-b tw-border-border', className)} {...props}>
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
      className={cn('tw-px-3 tw-py-3.5 tw-text-left tw-font-semibold tw-text-secondary', className)}
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
    <tr className={cn('tw-cursor-default', className)} {...props}>
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
        'tw-divide-y tw-divide-border/50',
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
        'tw-whitespace-nowrap tw-px-3 tw-py-2',
        alignItems === 'right' && 'tw-flex tw-items-end tw-justify-end',
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