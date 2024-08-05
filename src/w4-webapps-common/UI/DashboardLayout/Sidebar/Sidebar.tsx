/*************************************************************************/
/*  Sidebar.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { PropsWithChildren } from 'react'

import Image from 'next/image'
import cn from '../../../utils/classNamesMerge'
import { SidebarNav } from './SidebarNav'

export type SidebarProps = {
  visibilityModeOverlay: boolean;
  isShow: boolean;
  toggleSidebar: () => void;
} & SidebarContentProps & PropsWithChildren
export function Sidebar({
  visibilityModeOverlay,
  isShow,
  toggleSidebar,
  logoAltText,
  logoFullHref,
  children,
}: SidebarProps) {
  return (
    <>
      { /* Normal sidebar */ }
      <div className={cn(
        'tw-overflow-hidden tw-h-screen tw-min-w-[256px] tw-transition-colors tw-duration-300',
        { 'tw-basis-[256px] tw-min-w-[256px]': !visibilityModeOverlay },
        { 'tw-basis-[0px] tw-min-w-[0px]': visibilityModeOverlay },
      )}
      >
        <div className="tw-h-full">
          <SidebarContent
            logoAltText={logoAltText}
            logoFullHref={logoFullHref}
          >
            {children}
          </SidebarContent>
        </div>
      </div>

      { /* Overlay SideBar */ }
      <div
        className={
          cn(
            'tw-absolute tw-w-screen tw-h-screen tw-flex tw-z-10',
            { 'tw-pointer-events-none': !isShow },
          )
        }
      >
        <div className={cn(
          'tw-overflow-hidden tw-transition-all tw-duration-300',
          { 'tw-basis-[256px]': isShow },
          { 'tw-basis-[0px]': !isShow },
        )}
        >
          <div className="tw-h-full">
            <SidebarContent
              logoAltText={logoAltText}
              logoFullHref={logoFullHref}
            >
              {children}
            </SidebarContent>
          </div>
        </div>
        {/*
          This is shown next to the sidebard in the "narrow" mode.
          Clicking on it (thus outside the sidebar), will close the sidebar.
        */}
        <div
          tabIndex={-1}
          aria-hidden
          className={
            cn(
              'tw-basis-0 tw-grow tw-bg-black/25 tw-h-full tw-transition-all tw-duration-300',
              { 'tw-bg-black/40': isShow },
              { 'tw-bg-black/0': !isShow },
            )
          }
          onClick={toggleSidebar}
        />
      </div>
    </>
  )
}

type SidebarContentProps = {
  logoAltText: string;
  logoFullHref: string;
} & PropsWithChildren
function SidebarContent({
  logoAltText,
  logoFullHref,
  children,
} : SidebarContentProps) {
  return (
    <div className="tw-h-full tw-flex tw-flex-col tw-min-w-[256px] tw-bg-brand-600">
      <div className="tw-min-h-[4rem] tw-p-2 tw-bg-brand-800">
        <div className="tw-relative tw-h-full tw-w-full">
          <Image
            fill
            alt={logoAltText}
            src={logoFullHref}
          />
        </div>
      </div>

      <div className="tw-grow tw-overflow-y-auto">
        <SidebarNav>
          { children }
        </SidebarNav>
      </div>

      <div
        className={cn(
          'tw-items-center tw-min-h-[50px] tw-bg-brand-800',
        )}
      />
    </div>
  )
}
