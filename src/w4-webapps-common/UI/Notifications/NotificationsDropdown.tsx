/*************************************************************************/
/*  NotificationsDropdown.tsx                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import Dropdown from '../Dropdown/Dropdown'
import cn from '../../utils/classNamesMerge'

export type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  severity: string;
  createdAt: string;
  onClick?: () => void;
}

export type NotificationsDropdownProps = {
  notifications: Notification[];
  unreadNotificationsCount: number;
  notificationPageHref: string;
  markAllNotificationsAsRead?: () => void;
  markNotificationAsRead?: (id: string) => void;
  onMarkAsReadDone?: () => void;
}

export default function NotificationsDropdown({
  notifications,
  unreadNotificationsCount,
  notificationPageHref,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  onMarkAsReadDone,
} :NotificationsDropdownProps) {
  const hiddenUnreadCount = unreadNotificationsCount
    - notifications.filter((n) => (!n.isRead)).length

  return (
    <Dropdown>
      <Dropdown.Toggle
        as="div"
        className="text-xl text-scale-300 border-border border h-10 w-10 flex items-center justify-center rounded-full relative"
      >
        <FontAwesomeIcon icon={faBell} />
        {unreadNotificationsCount > 0 && (
          <div className="absolute right-1 bottom-1 z-10 h-4 w-4 flex items-center justify-center rounded-full off-bg-foreground text-xs  bg-danger-500 text-white">
            {unreadNotificationsCount}
          </div>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu placement="right" className="border-0 max-h-[600px] overflow-y-auto">
        {/*
        {states.length > 0 && (
          <>
            <div className="px-4 py-2 bg-surface-200/40 w-full min-w-[400px]">
              <span>Issues</span>
            </div>
            <div className="">
              {states.map((notification) => (
                <NotificationBox key={notification.id} notification={notification} />
              ))}
            </div>
          </>
        )}
        */}
        <div className="px-4 py-2 bg-surface-200/40 w-full min-w-[400px]">
          <span>Notifications</span>
        </div>

        {notifications.length > 0
          ? (
            <div>
              {notifications.map((notification) => (
                <NotificationBox
                  key={notification.id}
                  notification={notification}
                  onClick={async () => {
                    if (markNotificationAsRead) {
                      await markNotificationAsRead(notification.id)
                      if (onMarkAsReadDone) {
                        onMarkAsReadDone()
                      }
                    }
                  }}
                />
              ))}
            </div>
          )
          : (
            <div className="p-5 text-foreground-muted">
              No notifications
            </div>
          )}
        {notifications.length > 0 && (
          <div className="flex bg-surface-200/40 text-sm py-1 px-4 justify-between ">
            {notificationPageHref && (
              <Link
                href={notificationPageHref}
                className="cursor-pointer text-foreground-secondary font-bold hover:text-foreground no-underline flex items-center"
              >
                <div>
                  See all
                </div>
                {hiddenUnreadCount > 0 && <div className="ms-2 bg-danger-500 rounded-full w-3 h-3 text-center font-normal" />}
              </Link>
            )}
            <div
              className="cursor-pointer text-foreground-muted hover:text-foreground"
              onClick={async () => {
                if (markAllNotificationsAsRead) {
                  await markAllNotificationsAsRead()
                  if (onMarkAsReadDone) {
                    onMarkAsReadDone()
                  }
                }
              }}
              // For accessibility
              role="button"
              tabIndex={0}
              onKeyDown={async (e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter') {
                  if (markAllNotificationsAsRead) {
                    await markAllNotificationsAsRead()
                    if (onMarkAsReadDone) {
                      onMarkAsReadDone()
                    }
                  }
                }
              }}
            >
              Mark all as read
            </div>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

type NotificationBoxProps = {
  notification: Notification;
  onClick?: () => void;
}

function NotificationBox({
  notification,
  onClick,
}: NotificationBoxProps) {
  return (
    <div
      tabIndex={0}
      role="button"
      className={cn(
        notification.isRead && 'cursor-auto',
        !notification.isRead && 'cursor-pointer',
      )}
      onClick={() => {
        if (onClick) {
          onClick()
        }
      }}
      onKeyDown={(e) => {
        if (onClick && e.key === 'Enter') {
          onClick()
        }
      }}
    >
      <div className="border-t border-border first:border-0" />
      <div
        className={cn(
          'flex items-center py-2 px-4 border-border',
          notification.severity && 'border-l-2',
          notification.severity === 'error' && 'border-danger-500',
          notification.severity === 'warning' && 'border-warning-500',
          notification.severity === 'info' && 'border-info-500',
          notification.isRead && 'border-transparent',
        )}
      >
        {/* Notification content */}
        <div className="flex flex-col w-full">
          {/* Message */}
          <div
            className={cn(
              'text-sm text-foreground-secondary prose',
              !notification.isRead && 'font-bold',
              notification.isRead && 'text-foreground-muted',
            )}
          >
            {notification.message}
          </div>
          {/* CTA */}
          {/* notification.cta && (
            <div>
              <Button
                variant="outline-secondary"
                className="py-1 px-2 inline-block"
                onClick={() => {
                  window.open(notification.cta_link)
                }}
              >
                {notification.cta}
              </Button>
            </div>
              )
          */}
          {/* Timestamp */}
          <div className="text-xs text-foreground-muted mt-1">
            {formatTimestamp(notification.createdAt)}
          </div>
        </div>
      </div>
    </div>
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
