/*************************************************************************/
/*  index.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { SidebarNavGroup, SidebarNavItem, SidebarNavTitle } from './UI/DashboardLayout/Sidebar/SidebarNav'

import LoadingPage from './UI/LoadingPage'
import UnauthorizedPage from './UI/UnauthorizedPage'

const SidebarNav = {
  Title: SidebarNavTitle,
  Item: SidebarNavItem,
  Group: SidebarNavGroup,
}
export {
  SidebarNav,
}

export * from './Auth/LoginAutoRedirect'

export * from './UI/DashboardLayout/DashboardLayout'
export * from './UI/DashboardLayout/Header/HeaderNavDropdownMenu'

export * from './UI/Auth/AuthLayout'
export * from './UI/Auth/ForgottenPasswordForm'
export * from './UI/Auth/LoginForm'
export * from './UI/Auth/SignUpForm'
export * from './UI/Auth/UpdatePasswordForm'
export {
  LoadingPage,
  UnauthorizedPage,
}
