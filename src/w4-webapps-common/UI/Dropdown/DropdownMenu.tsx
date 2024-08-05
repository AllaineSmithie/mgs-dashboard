/*************************************************************************/
/*  DropdownMenu.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import cn from '../../utils/classNamesMerge'
// eslint-disable-next-line import/no-cycle
import { useDropdownContext } from './Dropdown'

type MenuProps = {
  className?: string;
  overflow?: 'auto' | 'scroll';
  placement?: 'right';
} & React.PropsWithChildren

export default function DropdownMenu({
  children, overflow, placement, className,
}:MenuProps) {
  const { isOpen } = useDropdownContext()
  if (!isOpen) return null
  return (
    <div
      className={cn(
        'tw-absolute tw-shadow tw-bg-surface-100 tw-z-10 tw-w-full tw-rounded-md tw-mt-1 tw-overflow-hidden tw-border tw-border-border-secondary  dark:tw-border-border',
        placement === 'right' && 'tw-right-0',
        className,
      )}
      style={{ minWidth: '100%', width: 'max-content' }}
    >
      <div className={cn(overflow && `tw-overflow-y-${overflow}`)}>
        {children}
      </div>
    </div>
  )
}
