/*************************************************************************/
/*  MainLayout.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React, {
  PropsWithChildren,
} from 'react'
import Head from 'next/head'
import { addBasePath } from 'next/dist/client/add-base-path'
import { ToastContainer } from 'react-toastify'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { User } from '@supabase/gotrue-js'
import 'react-toastify/dist/ReactToastify.css'
import {
  faBolt,
  faBook,
  faBug,
  faChartPie,
  faCog,
  faDiagramProject,
  faHome,
  faPeopleArrows,
  faPeopleGroup,
  faPowerOff,
  faSailboat,
  faServer,
  faTable,
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
      <SidebarNav.Item icon={faTable} href="/data/database">Database</SidebarNav.Item>
      <SidebarNav.Group toggleIcon={faWarehouse} toggleText="Storage">
        <SidebarNav.Item href="/data/storage/buckets">Buckets</SidebarNav.Item>
      </SidebarNav.Group>

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
        href={addBasePath('/settings/profile')}
        icon={faUser}
      >
        Profile
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
      <a className="tw-no-underline" href="https://deadline-entertainment.com">Metro Gaya Systems</a>
    </>
  )

  return (
    <LoginAutoRedirect
      isAuthorized={(user: User) => {
        const allowedRoles = process.env.NEXT_PUBLIC_SUPABASE_ALLOWED_ROLES?.split(',') || []
        return allowedRoles && allowedRoles.includes(String(user.role))
      }}
    >
      <Head>
        <title>MGS Dashboard</title>
        <meta name="description" content="MGS Dashboard" />
        <link rel="icon" href={addBasePath('/favicon.ico')} />
      </Head>
      <DashboardLayout
        header={{
          profileNavDropdownMenuContent,
          breadcrumb,
        }}
        sidebar={{
          logoAltText: 'MGS Logo',
          logoFullHref: addBasePath('/assets/brand/mgs-workspace.svg'),
          logoSmallHref: addBasePath('/assets/brand/mgs-small.svg'),
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
