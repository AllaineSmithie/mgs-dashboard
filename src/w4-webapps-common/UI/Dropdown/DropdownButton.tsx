/*************************************************************************/
/*  DropdownButton.tsx                                                   */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { PropsWithChildren, ReactNode } from 'react'
import cn from '../../utils/classNamesMerge'
import Dropdown from './Dropdown'
import type { ButtonProps } from '../Button'

type DropdownButtonProps = {
  title?: ReactNode;
  onSelect?: (eventKey?: string | number) => void;
  className?: string;
  placement?: 'right';
} & PropsWithChildren & Omit<ButtonProps, 'title'>

export default function DropdownButton({
  title, variant, placement, children, className, onSelect,
}:DropdownButtonProps) {
  return (
    <Dropdown onSelect={onSelect}>
      <Dropdown.Toggle variant={variant} className={cn('', className)}>
        {title}
      </Dropdown.Toggle>
      <Dropdown.Menu placement={placement}>
        {children}
      </Dropdown.Menu>
    </Dropdown>
  )
}
