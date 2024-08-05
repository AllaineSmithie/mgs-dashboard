/*************************************************************************/
/*  Dropdown.tsx                                                         */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

/* eslint-disable import/no-cycle */
import type { PropsWithChildren } from 'react'
import {
  useState, useEffect, useRef, createContext, useContext,
} from 'react'
import cn from '../../utils/classNamesMerge'
import DropdownToggle from './DropdownToggle'
import DropdownItem from './DropdownItem'
import DropdownMenu from './DropdownMenu'
import DropdownDivider from './DropdownDivider'
import DropdownHeader from './DropdownHeader'
import DropdownItemText from './DropdownItemText'

type EventType = React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>
type DropdownContextType = {
  isOpen: boolean;
  toggle: (e: EventType) => void;
  close: (e: EventType) => void;
  onSelect?: (eventKey?: string | number) => void;
}

const DropdownContext = createContext<DropdownContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
  onSelect: () => {},
})

export const useDropdownContext = () => useContext(DropdownContext)

type DropdownProps = {
  className?: string;
  as?: React.ElementType;
  onSelect?: (eventKey?: string | number) => void;
} & PropsWithChildren

function DropdownRoot({
  children, className, onSelect, as: Component = 'div',
}:DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggle = (e:EventType) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }
  const close = (e:EventType) => {
    e.stopPropagation()
    setIsOpen(false)
  }

  return (
    // This ESLint rule tells us to use useCallback and useMemo to prevent extra rerenders
    // But the performance impact of that is negligible in this case, better to just disable it
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <DropdownContext.Provider value={{
      isOpen, toggle, close, onSelect,
    }}
    >
      <Component ref={dropdownRef} className={cn('tw-relative', className)}>
        {children}
      </Component>
    </DropdownContext.Provider>
  )
}

const Dropdown = Object.assign(DropdownRoot, {
  Toggle: DropdownToggle,
  Menu: DropdownMenu,
  Item: DropdownItem,
  Divider: DropdownDivider,
  Header: DropdownHeader,
  ItemText: DropdownItemText,
})

export default Dropdown
