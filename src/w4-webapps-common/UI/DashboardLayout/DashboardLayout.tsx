/*************************************************************************/
/*  DashboardLayout.tsx                                                  */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import {
  PropsWithChildren, ReactNode, useCallback, useState,
} from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { Header } from './Header/Header'
import { BreadcrumbHeaderProps } from './Header/HeaderBreadcrumb'
import { Sidebar } from './Sidebar/Sidebar'
import Footer from './Footer/Footer'
import { NotificationsDropdownProps } from '../Notifications/NotificationsDropdown'

export type DashboardHeaderProps = {
  notifications?: NotificationsDropdownProps;
  breadcrumb?: BreadcrumbHeaderProps;
  profileNavDropdownMenuContent?: ReactNode;
}

export type DashboardSidebarProps = {
  logoAltText: string;
  logoFullHref: string;
  logoSmallHref: string;
  content? : ReactNode;
}

export type DashboardFooterProps = {
  content?: ReactNode;
}

export type DashboardLayoutProps = {
  header: DashboardHeaderProps;
  sidebar: DashboardSidebarProps;
  footer: DashboardFooterProps;
} & PropsWithChildren

export function DashboardLayout({
  header,
  sidebar,
  footer,
  children,
} : DashboardLayoutProps) {
  // Show status for xs screen
  const [visibilityModeOverlay, setVisibilityModeOverlay] = useState(false)
  const [isShowSidebar, setIsShowSidebar] = useState(false)

  const toggleIsShowSidebar = () => {
    setIsShowSidebar(!isShowSidebar)
  }

  const onResize = useCallback((width? : number) => {
    if (width === undefined) {
      return
    }
    const isSmall = width < 768
    setVisibilityModeOverlay(isSmall)
    if (!isSmall) {
      setIsShowSidebar(false)
    }
  }, [])

  const { ref } = useResizeDetector({ onResize })

  return (
    <div ref={ref} className="flex transition-colors bg-background">
      <Sidebar
        visibilityModeOverlay={visibilityModeOverlay}
        isShow={isShowSidebar}
        logoAltText={sidebar.logoAltText}
        logoFullHref={sidebar.logoFullHref}
        toggleSidebar={() => { setIsShowSidebar(!isShowSidebar) }}
      >
        {sidebar.content}
      </Sidebar>
      <div className="grow h-screen w-full flex flex-col items-stretch min-w-0">
        <Header
          showToggleSidebar={visibilityModeOverlay}
          toggleSidebar={toggleIsShowSidebar}
          notificationDropdownProps={header.notifications}
          breadcrumbProps={header.breadcrumb}
          navDropdownMenuContent={header.profileNavDropdownMenuContent}
        />

        <div className="grow flex flex-col md:items-center items-start overflow-auto">
          <div className="grow w-full md:p-8 p-4 max-w-[85rem]">
            {children}
          </div>
        </div>

        <Footer>
          {footer.content}
        </Footer>
      </div>
    </div>
  )
}
