/*************************************************************************/
/*  DropdownToggle.tsx                                                   */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import cn from '../../utils/classNamesMerge'
import Button from '../Button'
// eslint-disable-next-line import/no-cycle
import { useDropdownContext } from './Dropdown'
import type { ButtonProps } from '../Button'

type EventType = React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>
type DropdownToggleProps = {
  as?: React.ElementType;
  className?: string;
  disabled?: boolean;
} & React.PropsWithChildren & ButtonProps

export default function DropdownToggle({
  as: Component = Button,
  className,
  disabled,
  ...props
}: DropdownToggleProps) {
  const { toggle, toggleRef } = useDropdownContext()
  return (
    <Component
      ref={toggleRef}
      className={cn('cursor-pointer', className)}
      onClick={(e: EventType) => {
        if (disabled) {
          e.preventDefault()
          return
        }
        toggle(e)
      }}
      {...props}
    />
  )
}
