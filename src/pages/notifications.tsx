/*************************************************************************/
/*  notifications.tsx                                                    */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'
import MainLayout from '@components/MainLayout'
import NotificationsTable from '@webapps-common/UI/Notifications/NotificationsTable'
import { toast } from 'react-toastify'
import usePaginationState from '@webapps-common/hooks/usePaginationState'
import withSchema from '@services/withSchema'
import Button from '@webapps-common/UI/Button'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'
import Pagination from '@webapps-common/UI/Pagination'
import { RealtimeChannel } from '@supabase/supabase-js'

export default function Notifications() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'Notifications',
      }}
    >
      <NotificationsList />
    </MainLayout>
  )
}

export type Notification = {
  id: string;
  message: string;
  processed: boolean;
  severity: string;
  created_at: string;
}

type NotificationDelivery = {
  id: string;
  delivery_type: string;
  notification_id: string;
  processed: boolean;
  user_id: string ;
}

function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Realtime updates.
  const realtimeChannelRef = useRef<RealtimeChannel | null>()

  const supabase = useSupabaseClient()

  const sessionContext = useSessionContext()

  const paginationState = usePaginationState()

  const fetchNotifications = useCallback(async () => {
    const res = await withSchema(supabase, 'w4admin').rpc('get_my_dashboard_notifications', {}, { count: 'exact' }).range(paginationState.firstItemIndex, paginationState.lastItemIndex)
    if (res.error) {
      toast.error(`Could not fetch notification list: ${res.error.message}`)
      paginationState.setTotalCount(0)
      setNotifications([])
      return
    }
    paginationState.setTotalCount(res.count || 0)
    setNotifications(res.data as Notification[])
  }, [supabase, paginationState])

  useEffect(() => {
    fetchNotifications()
  }, [paginationState.currentPage])

  async function markAllNotificationsAsRead() {
    const res = await withSchema(supabase, 'w4admin').rpc('mark_all_my_dashboard_notifications_as_read')
    if (res.error) {
      toast.error(`Could not mark all notifications as read: ${res.error.message}`)
    }
  }

  async function markNotificationAsRead(notificationId : string) {
    const res = await withSchema(supabase, 'w4admin').rpc('mark_dashboard_notifications_as_read', { notification_id: notificationId })
    if (res.error) {
      toast.error(`Could not mark notification as read: ${res.error.message}`)
    }
  }

  // Subscribe to notifications updates.
  useEffect(() => {
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe()
    }
    const channel = supabase.realtime.channel('new-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'w4admin', table: 'notification_delivering' },
        async (payload) => {
          if (payload.errors) {
            toast.error(`Error on notification update: ${payload.errors.join(', ')}`)
            return
          }
          const entry = (payload.new || payload.old) as NotificationDelivery
          const user = sessionContext.session?.user
          if (entry && entry.delivery_type === 'dashboard' && entry.user_id === user?.id) {
            fetchNotifications()
          }
        },
      )
      .subscribe()
    if (!channel) {
      toast.error('Could not subscribe to notifications updates.')
    }
    realtimeChannelRef.current = channel
  }, [supabase.realtime, sessionContext.session?.user])

  return (
    <>
      <div className="flex items-center justify-between">
        <PaginationCounter {...paginationState.paginationCounterProps} />
        <Button
          onClick={async () => {
            await markAllNotificationsAsRead()
          }}
        >
          Mark all as read
        </Button>
      </div>
      <NotificationsTable
        notifications={notifications.map((n : Notification) => ({
          id: n.id,
          message: n.message,
          severity: n.severity,
          timestamp: n.created_at,
          isRead: n.processed,
          createdAt: n.created_at,
          onClick: async () => {
            await markNotificationAsRead(n.id)
          },
        }))}
      />
      <div className="flex justify-end mt-2">
        <Pagination
          {...paginationState.paginationProps}
        />
      </div>
    </>
  )
}
