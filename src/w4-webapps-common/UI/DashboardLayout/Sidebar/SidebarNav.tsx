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
          'tw-py-2 tw-ps-4 tw-pe-4 tw-text-scale-400 hover:tw-bg-brand-500 hover:tw-text-scale-200',
          { 'tw-bg-brand-800/50': activeLink },
          { 'tw-ps-8': context },
        )
      }
    >
      <Link href={href} className="tw-flex tw-items-center tw-no-underline !tw-text-inherit">
        <div className="tw-basis-8 tw-text-center tw-me-4">
          {icon ? <FontAwesomeIcon icon={icon} /> : <span className="tw-basis-16" />}
        </div>
        <div className="tw-grow">
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
    <li className="tw-py-2 tw-mt-3 tw-ps-4 tw-pe-4 tw-uppercase tw-font-bold tw-text-sm tw-text-scale-400">{children}</li>
  )
}

export function SidebarNavTitleInner({
  children,
}: PropsWithChildren) {
  const context = useContext(SideBarNavGroupContext)
  return (
    <li
      className={
        cn(
          'tw-py-2 tw-mt-3 tw-ps-4 tw-pe-4 tw-uppercase tw-text-sm tw-font-bold tw-text-scale-400',
          { 'tw-ps-8': context },
        )
      }
    >
      <div className="tw-grow">
        {children}
      </div>
    </li>
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
    <div className="tw-py-2 tw-ps-4 tw-pe-4 tw-text-scale-400 hover:tw-bg-brand-500 hover:tw-text-scale-200">
      <button
        type="button"
        className="tw-w-full tw-p-0 tw-flex tw-items-center tw-text-start tw-bg-transparent"
        onClick={() => (toggle())}
      >
        <div className="tw-basis-8 tw-text-center tw-me-4">
          {icon ? <FontAwesomeIcon icon={icon} /> : <span className="tw-basis-16" />}
        </div>
        <div className="tw-grow">
          {children}
        </div>
        <div>
          <FontAwesomeIcon className={cn({ 'tw-transition tw-duration-300': animation })} size="xs" icon={faChevronUp} rotation={collapsed ? 180 : undefined} />
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
        'tw-duration-0',
        { 'tw-bg-[#00000033]': isShow },
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

type SidebarNavGroupInnerToggleProps = {
  icon: IconDefinition;
  collapsed: boolean;
  animation: boolean;
  toggle: () => void;
} & PropsWithChildren
function SidebarNavGroupInnerToggle({
  icon,
  children,
  collapsed,
  animation,
  toggle,
}: SidebarNavGroupInnerToggleProps) {
  const context = useContext(SideBarNavGroupContext)
  return (
    <div className={cn(
          'tw-py-2 tw-ps-4 tw-pe-4 tw-text-scale-400 hover:tw-bg-brand-500 hover:tw-text-scale-200',
          { 'tw-ps-8': context },
        )}
        >
      <button
        type="button"
        className="tw-w-full tw-p-0 tw-flex tw-items-center tw-text-start tw-bg-transparent"
        onClick={() => (toggle())}
      >
        <div className="tw-basis-8 tw-text-center tw-me-4">
          {icon ? <FontAwesomeIcon icon={icon} /> : <span className="tw-basis-16" />}
        </div>
        <div className="tw-grow">
          {children}
        </div>
        <div>
          <FontAwesomeIcon className={cn({ 'tw-transition tw-duration-300': animation })} size="xs" icon={faChevronUp} rotation={collapsed ? 180 : undefined} />
        </div>
      </button>
    </div>
  )
}

type SidebarNavGroupInnerProps = {
  toggleIcon: IconDefinition;
  toggleText: string;
} & PropsWithChildren
export function SidebarNavGroupInner({
  toggleIcon,
  toggleText,
  children,
}: SidebarNavGroupInnerProps) {
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
        'tw-duration-0',
        { 'tw-bg-[#00000033]': isShow },
      )}
      >
        <SidebarNavGroupInnerToggle
          icon={toggleIcon}
          collapsed={!isShow}
          animation={animation}
          toggle={() => {
            setAnimation(true)
            setIsShow(!isShow)
          }}
        >
          {toggleText}
        </SidebarNavGroupInnerToggle>
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
