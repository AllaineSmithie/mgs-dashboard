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

export type DashboardHeaderProps = {
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
    <div ref={ref} className="tw-flex tw-transition-colors tw-bg-background">
      <Sidebar
        visibilityModeOverlay={visibilityModeOverlay}
        isShow={isShowSidebar}
        logoAltText={sidebar.logoAltText}
        logoFullHref={sidebar.logoFullHref}
        toggleSidebar={() => { setIsShowSidebar(!isShowSidebar) }}
      >
        {sidebar.content}
      </Sidebar>
      <div className="tw-grow tw-h-screen tw-w-full tw-flex tw-flex-col tw-items-stretch">
        <Header
          showToggleSidebar={visibilityModeOverlay}
          toggleSidebar={toggleIsShowSidebar}
          breadcrumbProps={header.breadcrumb}
          navDropdownMenuContent={header.profileNavDropdownMenuContent}
        />

        <div className="tw-grow tw-flex tw-flex-col md:tw-items-center tw-items-start tw-overflow-auto">
          <div className="tw-grow tw-w-full md:tw-p-8 tw-p-4 tw-max-w-[85rem]">
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
