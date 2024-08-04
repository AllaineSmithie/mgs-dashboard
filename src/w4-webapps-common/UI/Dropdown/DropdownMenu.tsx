/*************************************************************************/
/*  DropdownMenu.tsx                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useEffect, useLayoutEffect, useState } from 'react'
import cn from '../../utils/classNamesMerge'
// eslint-disable-next-line import/no-cycle
import { useDropdownContext } from './Dropdown'
import Portal from '../Portal'
import getCumulativeZIndex from './utils'

type MenuProps = {
  className?: string;
  overflow?: 'auto' | 'scroll';
  placement?: 'right';
} & React.PropsWithChildren

export default function DropdownMenu({
  children, overflow, placement, className,
}:MenuProps) {
  const { isOpen, toggleRef, menuRef } = useDropdownContext()
  const [menuStyle, setMenuStyle] = useState({})
  const [isRendered, setIsRendered] = useState(false)
  const [toggleZIndex, setToggleZIndex] = useState(0)

  // Set z-index to equal the toggle's z-index + 1
  useEffect(() => {
    if (isOpen && toggleRef?.current) {
      const zIndex = getCumulativeZIndex(toggleRef.current)
      setToggleZIndex(zIndex + 1)
    }
  }, [isOpen, toggleRef])

  useEffect(() => {
    // Trigger re-render once the menu is opened to ensure refs are set
    // (otherwise menuRef.current is null, preventing the menu from being positioned)
    setIsRendered(isOpen)
  }, [isOpen])

  const updateMenuPosition = () => {
    if (!toggleRef?.current || !menuRef?.current || !isOpen) return
    const toggleRect = toggleRef.current.getBoundingClientRect()
    const menuWidth = menuRef.current.offsetWidth

    const style = {
      top: `${toggleRect.bottom + window.scrollY}px`,
      left: '',
    }

    if (placement === 'right') {
      // Align menu's right edge with the toggle's right edge
      const leftPosition = toggleRect.right - menuWidth + window.scrollX
      style.left = `${leftPosition}px`
    } else {
      // Default to left alignment
      style.left = `${toggleRect.left + window.scrollX}px`
    }

    setMenuStyle(style)
  }

  useLayoutEffect(() => {
    // Place the menu in the correct position once it opens
    updateMenuPosition()
    // Ensure the menu remains in the correct position as the user scrolls
    window.addEventListener('scroll', updateMenuPosition, true)
    // Cleanup
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [isOpen, isRendered, toggleRef, menuRef, placement])

  if (!isOpen) return null

  return (
    <Portal>
      <div
        ref={menuRef}
        className={cn(
          'absolute shadow bg-surface-100 w-full rounded-md mt-1 overflow-hidden border border-border-secondary  dark:border-border',
          className,
        )}
        style={{ ...menuStyle, width: 'max-content', zIndex: toggleZIndex }}
      >
        <div className={cn(overflow && `overflow-y-${overflow}`)}>
          {children}
        </div>
      </div>
    </Portal>
  )
}
