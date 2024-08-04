/*************************************************************************/
/*  SidebarNav.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  IconDefinition,
} from '@fortawesome/free-regular-svg-icons'
import {
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons'
import React, {
  PropsWithChildren, createContext, useContext, useEffect, useState, useMemo,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import cn from '../../../utils/classNamesMerge'
import Collapse from '../../Collapse'

type SideBarNavGroupContextType = {
  forceExpand: (() => void) | null;
} | null
const SideBarNavGroupContext = createContext<SideBarNavGroupContextType>(null)

type SidebarNavItemProps = {
  href: string;
  icon?: IconDefinition;
  active?: boolean;
} & PropsWithChildren
export function SidebarNavItem({
  icon,
  href,
  active,
  children,
}: SidebarNavItemProps) {
  const context = useContext(SideBarNavGroupContext)
  const router = useRouter()

  let activeLink = active
  if (activeLink === undefined) {
    activeLink = router.pathname.startsWith(href)
  }

  useEffect(() => {
    if (activeLink && context?.forceExpand) {
      context?.forceExpand()
    }
  }, [activeLink, context])

  return (
    <li
      className={
        cn(
          'py-2 ps-4 pe-4 text-scale-400 hover:bg-brand-500 hover:text-scale-200',
          { 'bg-brand-800/50': activeLink },
          { 'ps-8': context },
        )
      }
    >
      <Link href={href} className="flex items-center no-underline !text-inherit">
        <div className="basis-8 text-center me-4">
          {icon ? <FontAwesomeIcon icon={icon} /> : <span className="basis-16" />}
        </div>
        <div className="grow">
          {children}
        </div>
      </Link>
    </li>
  )
}

export function SidebarNavTitle({
  children,
}: PropsWithChildren) {
  return (
    <li className="py-2 mt-3 ps-4 pe-4 uppercase font-bold text-sm text-scale-400">{children}</li>
  )
}

type SidebarNavGroupToggleProps = {
  icon: IconDefinition;
  collapsed: boolean;
  animation: boolean;
  toggle: () => void;
} & PropsWithChildren
function SidebarNavGroupToggle({
  icon,
  children,
  collapsed,
  animation,
  toggle,
}: SidebarNavGroupToggleProps) {
  return (
    <div className="py-2 ps-4 pe-4 text-scale-400 hover:bg-brand-500 hover:text-scale-200">
      <button
        type="button"
        className="w-full p-0 flex items-center text-start bg-transparent"
        onClick={() => (toggle())}
      >
        <div className="basis-8 text-center me-4">
          {icon ? <FontAwesomeIcon icon={icon} /> : <span className="basis-16" />}
        </div>
        <div className="grow">
          {children}
        </div>
        <div>
          <FontAwesomeIcon className={cn({ 'transition duration-300': animation })} size="xs" icon={faChevronUp} rotation={collapsed ? 180 : undefined} />
        </div>
      </button>
    </div>
  )
}

type SidebarNavGroupProps = {
  toggleIcon: IconDefinition;
  toggleText: string;
} & PropsWithChildren
export function SidebarNavGroup({
  toggleIcon,
  toggleText,
  children,
}: SidebarNavGroupProps) {
  const [isShow, setIsShow] = useState(false)
  const [animation, setAnimation] = useState(false)

  const newContext = useMemo(() => (
    {
      forceExpand: () => {
        setAnimation(false)
        setIsShow(true)
      },
    }), [])

  return (
    <SideBarNavGroupContext.Provider value={newContext}>
      <li className={cn(
        'duration-0',
        { 'bg-[#00000033]': isShow },
      )}
      >
        <SidebarNavGroupToggle
          icon={toggleIcon}
          collapsed={!isShow}
          animation={animation}
          toggle={() => {
            setAnimation(true)
            setIsShow(!isShow)
          }}
        >
          {toggleText}
        </SidebarNavGroupToggle>
        <Collapse show={isShow} animation={animation}>
          <ul>
            {children}
          </ul>
        </Collapse>
      </li>
    </SideBarNavGroupContext.Provider>
  )
}

export function SidebarNav({
  children,
} : PropsWithChildren) {
  return (
    <ul className="list-unstyled">
      { children }
    </ul>
  )
}
