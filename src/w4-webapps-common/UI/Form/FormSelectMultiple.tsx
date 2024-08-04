/*************************************************************************/
/*  FormSelectMultiple.tsx                                               */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronUp,
  faChevronDown,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import cn from '../../utils/classNamesMerge'
import { useFormGroup } from './FormGroup'

export type SelectItem = {
  name: string;
  value: string | number;
}

export type FormSelectProps = {
  name: string;
  value: SelectItem[]; // value is now an array of strings
  onChange: (event:
  | React.ChangeEvent<HTMLSelectElement>
  | { target: { name: string; value: SelectItem[] } }) => void;
  items: SelectItem[];
  isInvalid?: boolean;
  containerClassName?: string;
  // "Filter-as-you-type" mode.
  // When enabled, the dropdown will filter items based on what the user types into the input.
  // When disabled, the dropdown will show all items you can toggle on and off.
  filterable?: boolean;
  // Show the "down" arrow to toggle the dropdown.
  displayDropdownToggle?: boolean;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'>

export default function FormSelectMultiple({
  name,
  id,
  value,
  onChange,
  items,
  isInvalid,
  placeholder,
  containerClassName,
  filterable = true,
  displayDropdownToggle = true,
  ...props
}: FormSelectProps) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [filter, setFilter] = useState<string>('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  // Set the context's isInvalid when the Control's prop changes
  const { setIsInvalid, controlId } = useFormGroup()
  useEffect(() => {
    if (isInvalid) {
      setIsInvalid(isInvalid)
    }
  }, [isInvalid, setIsInvalid])

  // Scroll to the end of the input whenever value changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth
    }
  }, [value])

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

  function toggleDropdown() {
    setShowDropdown((prev) => !prev)
  }

  function deselectItem(item: SelectItem) {
    const newValue = value.filter((i) => i.value !== item.value)
    onChange({ target: { name, value: newValue } }) // Update Formik state
    setShowDropdown(false)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilter(e.target.value)
    if (!showDropdown) {
      setShowDropdown(true)
    }
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // When the user hits enter, add the top item on the list
    if (e.key === 'Enter' && filteredItems.length > 0) {
      const topItem = filteredItems[0]
      toggleSelectItem(topItem)
      e.preventDefault()
      return
    }
    // When the user hits backspace, remove the last item from the list
    if (e.key === 'Backspace' && filter === '' && value.length > 0) {
      deselectItem(value[value.length - 1])
    }
  }

  function toggleSelectItem(item: SelectItem) {
    const selected = value.some((i) => i.value === item.value)
    const newValue = selected
      ? value.filter((i: SelectItem) => i.value !== item.value)
      : [...value, item]
    onChange({ target: { name, value: newValue } }) // Update Formik state
    setFilter('') // clear the input
  }

  // Filter items based on what the user types into the input
  let filteredItems = items.filter(
    (item) => item.name.toLowerCase().includes(filter.toLowerCase()),
  )
  // Filter out already selected items from the list
  // If not filterable, we'll show all the items, each with a toggle
  if (filterable) {
    filteredItems = filteredItems.filter(
      (item) => !value.some((selectedItem) => selectedItem.value === item.value),
    )
  }
  return (
    <div ref={wrapperRef} className={cn('flex flex-col relative', containerClassName)}>
      <div
        className={cn(
          'flex border border-border bg-control rounded-md py-1 pl-1',
          showDropdown && 'rounded-b-none',
          isInvalid && 'border-danger-500 dark:border-danger-500',
        )}
        onClick={toggleDropdown}
        // For accessibility
        role="button"
        onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
        tabIndex={0} // Make the div focusable
      >
        <div ref={inputRef} className="flex flex-auto gap-1 overflow-x-auto scrollbar-hide">
          {value.map((item) => (
            <SelectedItem
              key={item.value}
              item={item}
              deselectItem={() => deselectItem(item)}
            />
          ))}
          {filterable && (
          <input
            type="text"
            value={filter}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            placeholder={placeholder || 'Select items...'}
            className="h-full flex items-center pl-2 border-none focus:ring-0 bg-transparent"
          />
          )}
          {!filterable && value.length === 0 && (
          <div className="text-scale-400 h-full flex items-center pl-2">
            {placeholder || 'Select items...'}
          </div>
          )}
          {/* Placeholder to maintain the height when items are empty */}
          <div className="h-[30px]" />
        </div>
        {/* Show/hide dropdown toggle */}
        {displayDropdownToggle && (
        <div className="text-sm text-scale-600 pl-2 pr-2.5 border-l flex items-center justify-center border-border cursor-pointer">
          {showDropdown ? (
            <FontAwesomeIcon icon={faChevronUp} />
          ) : (
            <FontAwesomeIcon icon={faChevronDown} />
          )}
        </div>
        )}
      </div>
      {/* Dropdown */}
      {showDropdown && (
        <div className="relative">
          <div className="absolute shadow  rounded-t-none border-t-0 bg-control z-40 w-full rounded overflow-hidden border border-border">
            <div className="scrollbar-no-borders flex flex-col w-full max-h-40 overflow-y-auto">
              {filteredItems.map((item) => (
                <ListItem
                  key={item.value}
                  item={item}
                  name={name}
                  value={value}
                  onChange={onChange}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Hidden Select */}
      <select
        multiple
        name={name}
        value={value.map((el) => (el.value.toString()))}
        onChange={onChange}
        className="hidden"
        id={id || controlId}
        {...props}
      >
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  )
}

type ListItemProps = {
  item: SelectItem;
  name: string;
  value: SelectItem[]; // Current value of the FormSelectMultiple
  onChange: FormSelectProps['onChange']; // Use the same onChange type as in FormSelectProps
}

function ListItem({
  item, name, value, onChange,
}: ListItemProps) {
  const selected = value.some((i) => i.value === item.value)
  function toggleSelectItem() {
    const newValue = selected
      ? value.filter((i: SelectItem) => i.value !== item.value)
      : [...value, item]
    onChange({ target: { name, value: newValue } }) // Update Formik state
  }
  return (
    <div
      className="cursor-pointer w-full border-b last:border-b-0 hover:bg-brand-400/50 border-border   dark:hover:bg-brand-600/40"
      onClick={toggleSelectItem}
      // For accessibility
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && toggleSelectItem()}
      tabIndex={0} // Make the div focusable
    >
      <div
        className={cn(
          'flex w-full items-center p-2 pl-1 border-transparent border-l-2 relative',
          { 'border-brand-600 dark:border-brand-400': selected },
        )}
      >
        <div className="w-full items-center flex">
          <div className="mx-2 leading-6">{item.name}</div>
        </div>
      </div>
    </div>
  )
}

type SelectedItemProps = {
  item: SelectItem;
  deselectItem: () => void;
}

function SelectedItem({ item, deselectItem }: SelectedItemProps) {
  return (
    <div className="flex justify-center text-sm font-normal text-nowrap whitespace-nowrap items-center cursor-default py-1 px-2 gap-1 rounded-md text-brand-550 bg-brand-400/50 border border-brand-600/30 dark:text-brand-200 dark:border-brand-500 dark:bg-brand-600/40">
      {item.name}
      <div
        onClick={(e) => {
          // Don't pass event down to parent component
          e.stopPropagation()
          deselectItem()
        }}
        // For accessibility
        onKeyDown={(e) => {
          // Trigger deselectItem on Enter key press
          if (e.key === 'Enter') {
            deselectItem()
          }
        }}
        role="button" // Assign a role of 'button'
        tabIndex={0} // Make the element focusable
      >
        <FontAwesomeIcon icon={faTimes} className="cursor-pointer" />
      </div>
    </div>
  )
}
