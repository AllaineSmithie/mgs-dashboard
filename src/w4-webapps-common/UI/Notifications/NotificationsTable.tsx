/*************************************************************************/
/*  NotificationsTable.tsx                                               */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '../Table/Table'
import cn from '../../utils/classNamesMerge'

export type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  severity: string;
  createdAt: string;
  onClick?: () => void;
}

export type NotificationsTableProps = {
  notifications : Notification[];
}
export default function NotificationsTable({
  notifications,
} : NotificationsTableProps) {
  return (
    <Table className="mt-2 rounded overflow-hidden">
      <Table.Body>
        {notifications.map((notification) => (
          <Table.Row
            tabIndex={0}
            role="button"
            className={cn(
              !notification.isRead && 'cursor-pointer',
            )}
            onClick={() => {
              if (notification.onClick) {
                notification.onClick()
              }
            }}
            onKeyDown={(e) => {
              if (notification.onClick && e.key === 'Enter') {
                notification.onClick()
              }
            }}
            key={notification.id}
          >

            <Table.DataCell
              className={cn(
                '',
                notification.severity && 'border-l-2',
                notification.severity === 'error' && 'border-danger-500',
                notification.severity === 'warning' && 'border-warning-500',
                notification.severity === 'info' && 'border-info-500',
                notification.isRead && 'border-transparent',
              )}
            />
            <Table.DataCell>
              <div
                className={cn(
                  'text-foreground-secondary prose whitespace-normal',
                  notification.isRead && 'text-foreground-muted',
                  !notification.isRead && 'font-bold',
                )}
              >
                {notification.message}
              </div>
            </Table.DataCell>
            <Table.DataCell>
              <div className="text-xs text-foreground-muted">{formatTimestamp(notification.createdAt)}</div>
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export function formatTimestamp(timestamp: string) {
  const optionsDate: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }

  const date = new Date(timestamp)
  const formattedDate = date.toLocaleDateString('en-US', optionsDate)
  const formattedTime = date.toLocaleTimeString('en-US', optionsTime).toLowerCase()

  return `${formattedDate}, ${formattedTime}`
}
