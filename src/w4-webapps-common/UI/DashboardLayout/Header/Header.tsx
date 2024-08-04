/*************************************************************************/
/*  Header.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { ReactNode } from 'react'
import NotificationsDropdown, { NotificationsDropdownProps } from '../../Notifications/NotificationsDropdown'
import { BreadcrumbHeader, BreadcrumbHeaderProps } from './HeaderBreadcrumb'
import { HeaderNavDropdownMenu } from './HeaderNavDropdownMenu'
import Button from '../../Button'
import cn from '../../../utils/classNamesMerge'

export type HeaderProps = {
  notificationDropdownProps?: NotificationsDropdownProps;
  breadcrumbProps?: BreadcrumbHeaderProps;
  navDropdownMenuContent: ReactNode | undefined;
  showToggleSidebar: boolean;
  toggleSidebar: () => void;
}
export function Header({
  notificationDropdownProps,
  breadcrumbProps,
  navDropdownMenuContent,
  showToggleSidebar,
  toggleSidebar,
}: HeaderProps) {
  return (
    <header
      className={
        cn(
          'min-h-[4rem] border-b-[1px] border-b-border flex items-center ps-8 pe-4 py-2',
          { 'ps-4': showToggleSidebar },
        )
      }
    >
      <Button
        variant="no-background"
        className={cn('px-4 me-2 hover:text-brand-200 bg-transparent hover:bg-transparent', !showToggleSidebar && 'hidden')}
        type="button"
        onClick={toggleSidebar}
      >
        <FontAwesomeIcon icon={faBars} />
      </Button>

      {breadcrumbProps && (
        <BreadcrumbHeader
          {...breadcrumbProps}
        />
      )}
      <div className="grow" />
      <div className="ms-2 flex">
        {notificationDropdownProps && (
          <NotificationsDropdown {...notificationDropdownProps} />
        )}
        <HeaderNavDropdownMenu>
          {navDropdownMenuContent}
        </HeaderNavDropdownMenu>
      </div>
    </header>
  )
}
