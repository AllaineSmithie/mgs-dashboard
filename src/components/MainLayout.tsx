/*************************************************************************/
/*  MainLayout.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React, {
  PropsWithChildren, useCallback, useEffect, useRef, useState,
} from 'react'
import Head from 'next/head'
import { addBasePath } from 'next/dist/client/add-base-path'
import { ToastContainer, toast } from 'react-toastify'
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'
import { User } from '@supabase/gotrue-js'
import 'react-toastify/dist/ReactToastify.css'
import {
  faBolt,
  faBook,
  faBoxArchive,
  faBug,
  faChartPie,
  faCog,
  faDiagramProject,
  faGlobe,
  faHome,
  faPeopleArrows,
  faPeopleGroup,
  faPowerOff,
  faSailboat,
  faServer,
  faTableList,
  faTerminal,
  faTrowelBricks,
  faUser,
  faUsers,
  faWarehouse,
} from '@fortawesome/free-solid-svg-icons'
import {
  DashboardLayout,
  LoginAutoRedirect,
  HeaderNavDropdownMenu,
  SidebarNav,
} from '@webapps-common'
import { BreadcrumbHeaderProps } from '@webapps-common/UI/DashboardLayout/Header/HeaderBreadcrumb'
import withSchema from '@services/withSchema'
import { RealtimeChannel } from '@supabase/supabase-js'

type MainLayoutProps = {
  breadcrumb?: BreadcrumbHeaderProps;
} & PropsWithChildren
export default function MainLayout({
  breadcrumb,
  children,
}: MainLayoutProps) {
  const sidebarNav = (
    <>
      <SidebarNav.Item icon={faHome} href="/home">
        Home
      </SidebarNav.Item>

      <SidebarNav.Title>Users</SidebarNav.Title>
      <SidebarNav.Item icon={faUsers} href="/users">User list</SidebarNav.Item>

      <SidebarNav.Title>Data</SidebarNav.Title>
      <SidebarNav.Item icon={faTableList} href="/data/database/tables">Database</SidebarNav.Item>
      <SidebarNav.Item icon={faBoxArchive} href="/data/database/backups">Backups</SidebarNav.Item>
      <SidebarNav.Item icon={faWarehouse} href="/data/storage/buckets">File storage</SidebarNav.Item>
      <SidebarNav.Item icon={faTerminal} href="/data/sql">SQL Editor</SidebarNav.Item>

      <SidebarNav.Title>Multiplayer</SidebarNav.Title>
      <SidebarNav.Item icon={faChartPie} href="/multiplayer/overview">Overview</SidebarNav.Item>
      <SidebarNav.Item icon={faServer} href="/multiplayer/servers">Game servers</SidebarNav.Item>
      <SidebarNav.Item icon={faPeopleGroup} href="/multiplayer/lobbies">Lobbies</SidebarNav.Item>
      <SidebarNav.Item icon={faBug} href="/multiplayer/logs">Logs</SidebarNav.Item>
      <SidebarNav.Group toggleIcon={faCog} toggleText="Configuration">
        <SidebarNav.Item icon={faTrowelBricks} href="/multiplayer/builds">Builds</SidebarNav.Item>
        <SidebarNav.Item icon={faDiagramProject} href="/multiplayer/clusters">Clusters</SidebarNav.Item>
        <SidebarNav.Item icon={faSailboat} href="/multiplayer/fleets">Fleets</SidebarNav.Item>
        <SidebarNav.Item icon={faPeopleArrows} href="/multiplayer/matchmaker">Matchmaker</SidebarNav.Item>
      </SidebarNav.Group>
      <SidebarNav.Title>Web</SidebarNav.Title>
      <SidebarNav.Item icon={faGlobe} href="/web/web-builds">Web builds</SidebarNav.Item>
      <SidebarNav.Title>Docs</SidebarNav.Title>
      <SidebarNav.Item icon={faBook} href="/docs/api">API</SidebarNav.Item>
      <SidebarNav.Item icon={faBolt} href="http://w4games.com">W4Games</SidebarNav.Item>
    </>
  )

  const sessionContext = useSessionContext()
  const profileNavDropdownMenuContent = (
    <>
      <HeaderNavDropdownMenu.ItemText>
        <b>{sessionContext.session?.user.email}</b>
      </HeaderNavDropdownMenu.ItemText>
      <HeaderNavDropdownMenu.Divider />
      <HeaderNavDropdownMenu.Header>Settings</HeaderNavDropdownMenu.Header>
      <HeaderNavDropdownMenu.Item
        href={addBasePath('/settings/account')}
        icon={faUser}
      >
        Account
      </HeaderNavDropdownMenu.Item>
      <HeaderNavDropdownMenu.ThemeSwitch />
      <HeaderNavDropdownMenu.Divider />
      <HeaderNavDropdownMenu.Item
        href={addBasePath('/auth/logout')}
        icon={faPowerOff}
      >
        Logout
      </HeaderNavDropdownMenu.Item>
    </>
  )

  const footerContent = (
    <>
      Powered by
      {' '}
      <a className="no-underline" href="https://deadline-entertainment.com">Deadline Entertainment</a>
    </>
  )

  const notificationsDropdownProps = useNotifications()

  return (
    <LoginAutoRedirect
      isAuthorized={(user: User) => {
        const allowedRoles = process.env.NEXT_PUBLIC_SUPABASE_ALLOWED_ROLES?.split(',') || []
        return allowedRoles && allowedRoles.includes(String(user.role))
      }}
      loginPageHref="/auth/login"
      mfaPageHref="/auth/mfa"
    >
      <Head>
        <title>W4 Dashboard</title>
        <meta name="description" content="W4 Dashboard" />
        <link rel="icon" href={addBasePath('/favicon.ico')} />
      </Head>
      <DashboardLayout
        header={{
          profileNavDropdownMenuContent,
          breadcrumb,
          notifications: notificationsDropdownProps,
        }}
        sidebar={{
          logoAltText: 'W4games Logo',
          logoFullHref: addBasePath('/assets/brand/w4games-workspace.svg'),
          logoSmallHref: addBasePath('/assets/brand/w4games-small.svg'),
          content: sidebarNav,
        }}
        footer={{
          content: footerContent,
        }}
      >
        { children }
        <ToastContainer position="bottom-right" theme="colored" />
      </DashboardLayout>
    </LoginAutoRedirect>
  )
}

type Notification = {
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

function useNotifications(maxNotifications : number = 5) {
  // --- Notifications ---
  const [notifications, setNotifications] = useState<Notification[]>([])

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0)

  // Realtime updates.
  const realtimeChannelRef = useRef<RealtimeChannel | null>()

  const supabase = useSupabaseClient()

  const sessionContext = useSessionContext()

  // Fetch notifications.
  const fetchNotifications = useCallback(async () => {
    const res = await withSchema(supabase, 'w4admin').rpc('get_my_dashboard_notifications').limit(maxNotifications + 1)
    if (res.error) {
      toast.error(`Could not fetch notification list: ${res.error.message}`)
      setNotifications([])
      return
    }
    if (res.data.length >= maxNotifications) {
      setNotifications(res.data.slice(0, -1) as Notification[])
    } else {
      setNotifications(res.data as Notification[])
    }
  }, [supabase, maxNotifications])

  // Count unread notificaitons.
  const fetchUnreadNotifications = useCallback(async () => {
    const res = await withSchema(supabase, 'w4admin').rpc('get_my_dashboard_notifications', {}, { count: 'exact' }).filter('processed', 'eq', false).limit(0)
    if (res.error) {
      toast.error(`Could not fetch notification list: ${res.error.message}`)
      setUnreadNotificationsCount(0)
      return
    }
    setUnreadNotificationsCount(res.count || 0)
  }, [supabase])

  useEffect(() => {
    fetchNotifications()
    fetchUnreadNotifications()
  }, [])

  // Subscribe to notifications updates.
  useEffect(() => {
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe()
    }
    const channel = supabase.realtime.channel('new-notifications-main-layout')
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
            fetchUnreadNotifications()
          }
        },
      )
      .subscribe()
    if (!channel) {
      toast.error('Could not subscribe to notifications updates.')
    }
    realtimeChannelRef.current = channel
  }, [supabase.realtime, sessionContext.session?.user])

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

  return {
    notifications: notifications.map((n : Notification) => ({
      id: n.id,
      message: n.message,
      severity: n.severity,
      timestamp: n.created_at,
      isRead: n.processed,
      createdAt: n.created_at,
    })),
    unreadNotificationsCount,
    notificationPageHref: '/notifications',
    markAllNotificationsAsRead,
    markNotificationAsRead,
  }
}
