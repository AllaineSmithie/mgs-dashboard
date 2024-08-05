/*************************************************************************/
/*  HeaderNavDropdownMenu.tsx                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import React, { PropsWithChildren } from 'react'
import {
  faDesktop,
} from '@fortawesome/free-solid-svg-icons'
import {
  faCircle, faCircleDot, faMoon, faSun,
} from '@fortawesome/free-regular-svg-icons'
import Image from 'next/image'
import { addBasePath } from 'next/dist/client/add-base-path'
import { useTheme } from 'next-themes'
import Dropdown from '../../Dropdown/Dropdown'

type DropdownItemWithCheckboxProps = {
  checked : boolean;
  onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>
  ) => void;
} & PropsWithChildren

function DropdownItemWithCheckbox({ checked, children, onClick }: DropdownItemWithCheckboxProps) {
  return (
    <Dropdown.Item className="tw-flex" onClick={onClick}>
      <div style={{ width: '100%' }}>
        {children}
      </div>
      <span className="tw-float-right">
        { checked
          ? <FontAwesomeIcon className="tw-ms-2" icon={faCircleDot} fixedWidth />
          : <FontAwesomeIcon className="tw-ms-2" icon={faCircle} fixedWidth />}
      </span>
    </Dropdown.Item>
  )
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  return (
    <>
      <Dropdown.Header>Theme</Dropdown.Header>
      <DropdownItemWithCheckbox checked={theme === 'dark'} onClick={() => (setTheme('dark'))}>
        <FontAwesomeIcon className="tw-me-2" icon={faMoon} fixedWidth />
        Dark theme
      </DropdownItemWithCheckbox>

      <DropdownItemWithCheckbox checked={theme === 'light'} onClick={() => (setTheme('light'))}>
        <FontAwesomeIcon className="tw-me-2" icon={faSun} fixedWidth />
        Light theme
      </DropdownItemWithCheckbox>

      <DropdownItemWithCheckbox checked={theme === 'system'} onClick={() => (setTheme('system'))}>
        <FontAwesomeIcon className="tw-me-2" icon={faDesktop} fixedWidth />
        System theme
      </DropdownItemWithCheckbox>
    </>
  )
}

export type ItemProps = {
  href?: string;
  icon?: IconProp;
  children?: string;
}
export class HeaderNavDropdownMenu extends React.Component<PropsWithChildren> {
  static Divider = Dropdown.Divider

  static Header = Dropdown.Header

  static ItemText = Dropdown.ItemText

  static ThemeSwitch = ThemeSwitch

  static Item({
    href,
    icon,
    children,
  } : ItemProps) {
    return (
      <Dropdown.Item href={href}>
        {icon && <FontAwesomeIcon className="tw-me-2" icon={icon} fixedWidth />}
        {children}
      </Dropdown.Item>
    )
  }

  render() {
    const { children } = this.props
    return (
      <div className="tw-flex tw-flex-wrap">
        <Dropdown>
          <Dropdown.Toggle as="div" className="py-0 px-2 rounded-0" id="dropdown-profile">
            <div className="tw-h-10 tw-w-10 tw-relative">
              <Image
                fill
                sizes="10vw"
                className="tw-rounded-full"
                src={addBasePath('/assets/img/avatars/user-solid.svg')}
                alt="User profile dropdown"
              />
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu placement="right">
            { children }
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }
}
