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
        'overflow-hidden h-screen min-w-[256px] transition-colors duration-300',
        { 'basis-[256px] min-w-[256px]': !visibilityModeOverlay },
        { 'basis-[0px] min-w-[0px]': visibilityModeOverlay },
      )}
      >
        <div className="h-full">
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
            'absolute w-screen h-screen flex z-10',
            { 'pointer-events-none': !isShow },
          )
        }
      >
        <div className={cn(
          'overflow-hidden transition-all duration-300',
          { 'basis-[256px]': isShow },
          { 'basis-[0px]': !isShow },
        )}
        >
          <div className="h-full">
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
              'basis-0 grow bg-black/25 h-full transition-all duration-300',
              { 'bg-black/40': isShow },
              { 'bg-black/0': !isShow },
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
    <div className="h-full flex flex-col min-w-[256px] bg-brand-600">
      <div className="min-h-[4rem] p-2 bg-brand-800">
        <div className="relative h-full w-full">
          <Image
            fill
            alt={logoAltText}
            src={logoFullHref}
          />
        </div>
      </div>

      <div className="grow overflow-y-auto">
        <SidebarNav>
          { children }
        </SidebarNav>
      </div>

      <div
        className={cn(
          'items-center min-h-[50px] bg-brand-800',
        )}
      />
    </div>
  )
}
