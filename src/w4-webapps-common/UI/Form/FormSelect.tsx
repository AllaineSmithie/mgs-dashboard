/*************************************************************************/
/*  FormSelect.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import {
  ReactNode, useEffect, useLayoutEffect, useRef, useState,
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import cn from '../../utils/classNamesMerge'
import { useFormGroup } from './FormGroup'
import Portal from '../Portal'
import getCumulativeZIndex from '../Dropdown/utils'

type FormSelectProps = {
  name: string;
  value: string | number | undefined;
  placeholder: string;
  onChange: (
    event:
    | React.ChangeEvent<HTMLSelectElement>
    | { target: { name: string; value: string | number } }
  ) => void;
  items: FormSelectItem[];
  isInvalid?: boolean;
} & React.SelectHTMLAttributes<HTMLSelectElement>

export type FormSelectItem = {
  name: string;
  value?: string | number;
  className?: string;
  type?: 'header';
  depth?: number; // left padding for the item
}

export default function FormSelect({
  name,
  id,
  value,
  placeholder = 'Select item',
  onChange,
  items,
  isInvalid,
  ...props
}: FormSelectProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownStyles, setDropdownStyles] = useState({})
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isRendered, setIsRendered] = useState(false)

  // Set the context's isInvalid when the Control's prop changes
  const { setIsInvalid, controlId } = useFormGroup()
  useEffect(() => {
    if (isInvalid) {
      setIsInvalid(isInvalid)
    }
  }, [isInvalid, setIsInvalid])

  function toggleDropdown() {
    if (items.length === 0) return
    setShowDropdown((prev) => !prev)
  }

  function selectItem(item: FormSelectItem) {
    // Mimic a standard HTML select event
    onChange({ target: { name, value: item.value ? item.value : '' } })
    setShowDropdown(false)
  }

  // Position the dropdown below the control
  const updateDropdownPosition = () => {
    if (!wrapperRef.current || !dropdownRef.current) return

    const wrapperRect = wrapperRef.current.getBoundingClientRect()
    const zIndex = getCumulativeZIndex(wrapperRef.current)

    setDropdownStyles({
      top: `${wrapperRect.bottom + window.scrollY}px`,
      left: `${wrapperRect.left + window.scrollX}px`,
      width: `${wrapperRect.width}px`,
      zIndex: zIndex + 1,
    })
  }

  useEffect(() => {
    // Trigger re-render once the select menu is opened to ensure refs are set
    // (otherwise dropdownRef.current is null, preventing the menu from being positioned)
    setIsRendered(showDropdown)
  }, [showDropdown])

  // Position the dropdown as soon as it's opened and rendered
  useEffect(() => {
    if (isRendered) {
      updateDropdownPosition()
    }
  }, [isRendered])

  // Update the dropdown position when the window is scrolled or resized
  useLayoutEffect(() => {
    if (showDropdown) {
      window.addEventListener('scroll', updateDropdownPosition, true)
      window.addEventListener('resize', updateDropdownPosition)
    }
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('resize', updateDropdownPosition)
    }
  }, [showDropdown])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current
        && !wrapperRef.current.contains(event.target as Node)
        && dropdownRef.current
        && !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  let selectedDisplay: ReactNode = (
    <span className="text-scale-600">
      {items.length > 0 ? placeholder : 'No items...'}
    </span>
  )
  const found = items.find(
    (i) => (i.value || '').toString() === (value || '').toString() && i.type !== 'header',
  )
  if (found) {
    selectedDisplay = found.name
  }
  return (
    <div ref={wrapperRef} className="flex flex-col relative w-full">
      <div
        className={cn(
          'flex ring-1 ring-inset bg-control rounded-md py-1 pl-1 ring-border w-full',
          showDropdown && 'rounded-b-none',
          isInvalid && 'ring-danger-400 dark:ring-danger-400',
        )}
        onClick={toggleDropdown}
        // For accessibility
        role="button"
        onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
        tabIndex={0} // Make the div focusable
      >
        {/* Selected item display */}
        <div className="px-2 py-1 w-full" style={{ maxWidth: 'calc(100% - 32px)' }}>
          <div className="whitespace-nowrap truncate">
            {selectedDisplay}
          </div>
        </div>
        {/* Show/hide dropdown toggle */}
        <div
          className={cn(
            'text-sm text-scale-600 pl-2 pr-2.5 border-l flex items-center justify-center border-border',
          )}
        >
          {showDropdown ? (
            <FontAwesomeIcon icon={faChevronUp} />
          ) : (
            <FontAwesomeIcon icon={faChevronDown} />
          )}
        </div>
      </div>
      {/* Dropdown */}
      {showDropdown && (
        <Portal>
          {/* top-0 is necessary here. Without it, after dropdown renders,
          it's positioned at the end of the page, causing a scrollbar to appear for a
          split second, which messes up the dropdown positioning calculation. */}
          <div ref={dropdownRef} style={dropdownStyles} className={cn('absolute top-0 invisible', isRendered && 'visible')}>
            <div className="shadow rounded-t-none border-t-0 bg-surface-100 z-40 w-full rounded overflow-hidden border border-border-secondary dark:border-border">
              <div className="scrollbar-no-borders flex flex-col w-full max-h-64 overflow-y-auto overflow-x-hidden">
                {items.map((item) => (
                  <ListItem
                    key={item.value || ''}
                    item={item}
                    onClick={() => selectItem(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Portal>
      )}
      {/* Hidden Select */}
      <select
        name={name}
        value={value}
        id={id || controlId}
        onChange={onChange}
        style={{ display: 'none' }}
        {...props}
      >
        {items.map((item) => (
          <option key={item.value || ''} value={item.value}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  )
}

type ListItemProps = {
  item: FormSelectItem;
  onClick: () => void;
}

function ListItem({ item, onClick }: ListItemProps) {
  const depth = item.depth || 0
  if (item.type === 'header') {
    return (
      <div className="flex w-full items-center py-0.5 px-2 border-border/50 border-b text-sm leading-6 text-scale-600 dark:text-scale-400 cursor-default font-bold">
        <div style={{ paddingLeft: `${depth * 4}px` }}>
          {item.name}
        </div>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'cursor-pointer w-full border-border/50 border-b last:border-b-0 hover:bg-brand-400/50   dark:hover:bg-brand-600/40',
        item.className,
      )}
      onClick={onClick}
      // For accessibility
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      tabIndex={0} // Make the div focusable
    >
      <div
        className={cn(
          'flex w-full items-center py-2 border-transparent border-l-2 relative',
        )}
      >
        <div className="w-full items-center flex">
          <div className="mx-2 leading-6 w-full">
            <div className="whitespace-nowrap truncate pr-3" style={{ paddingLeft: `${depth * 4}px` }}>
              {item.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
