/*************************************************************************/
/*  FormSelect.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import {
  ReactNode, useEffect, useRef, useState,
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import cn from '../../utils/classNamesMerge'
import { useFormGroup } from './FormGroup'

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
  const wrapperRef = useRef<HTMLDivElement>(null)

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
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current
        && !wrapperRef.current.contains(event.target as Node)
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
    <span className="tw-text-scale-600">
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
    <div ref={wrapperRef} className="tw-flex tw-flex-col tw-relative tw-w-full">
      <div
        className={cn(
          'tw-flex tw-ring-1 tw-ring-inset tw-bg-control tw-rounded-md tw-py-1 tw-pl-1 tw-ring-border tw-w-full',
          showDropdown && 'tw-rounded-b-none',
          isInvalid && 'tw-ring-danger-400 dark:tw-ring-danger-400',
        )}
        onClick={toggleDropdown}
        // For accessibility
        role="button"
        onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
        tabIndex={0} // Make the div focusable
      >
        {/* Selected item display */}
        <div className="tw-px-2 tw-py-1 tw-w-full" style={{ maxWidth: 'calc(100% - 32px)' }}>
          <div className="tw-whitespace-nowrap tw-truncate">
            {selectedDisplay}
          </div>
        </div>
        {/* Show/hide dropdown toggle */}
        <div
          className={cn(
            'tw-text-sm tw-text-scale-600 tw-pl-2 tw-pr-2.5 tw-border-l tw-flex tw-items-center tw-justify-center tw-border-border',
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
        <div className="tw-relative">
          <div className="tw-absolute tw-shadow tw-rounded-t-none tw-border-t-0 tw-bg-surface-100 tw-z-40 tw-w-full tw-rounded tw-overflow-hidden tw-border tw-border-border-secondary dark:tw-border-border">
            <div className="scrollbar-no-borders tw-flex tw-flex-col tw-w-full tw-max-h-64 tw-overflow-y-auto tw-overflow-x-hidden">
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
      <div className="tw-flex tw-w-full tw-items-center tw-py-0.5 tw-px-2 tw-border-border/50 tw-border-b tw-text-sm tw-leading-6 tw-text-scale-600 dark:tw-text-scale-400 tw-cursor-default tw-font-bold">
        <div style={{ paddingLeft: `${depth * 4}px` }}>
          {item.name}
        </div>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'tw-cursor-pointer tw-w-full tw-border-border/50 tw-border-b last:tw-border-b-0 hover:tw-bg-brand-400/50   dark:hover:tw-bg-brand-600/40',
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
          'tw-flex tw-w-full tw-items-center tw-py-2 tw-border-transparent tw-border-l-2 tw-relative',
        )}
      >
        <div className="tw-w-full tw-items-center tw-flex">
          <div className="tw-mx-2 tw-leading-6 tw-w-full">
            <div className="tw-whitespace-nowrap tw-truncate tw-pr-3" style={{ paddingLeft: `${depth * 4}px` }}>
              {item.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
