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
  ...props
}: FormSelectProps) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Set the context's isInvalid when the Control's prop changes
  const { setIsInvalid, controlId } = useFormGroup()
  useEffect(() => {
    if (isInvalid) {
      setIsInvalid(isInvalid)
    }
  }, [isInvalid, setIsInvalid])

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

  return (
    <div ref={wrapperRef} className={cn('tw-flex tw-flex-col tw-relative', containerClassName)}>
      <div
        className={cn(
          'tw-flex tw-border tw-border-border tw-bg-control tw-rounded-md tw-py-1 tw-pl-1',
          showDropdown && 'tw-rounded-b-none',
          isInvalid && 'tw-border-danger-500 dark:tw-border-danger-500',
        )}
        onClick={toggleDropdown}
        // For accessibility
        role="button"
        onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
        tabIndex={0} // Make the div focusable
      >
        <div className="tw-flex tw-flex-auto tw-flex-wrap tw-gap-1">
          {value.length === 0 && (
            <div className="tw-text-scale-400 tw-h-full tw-flex tw-items-center tw-pl-2">
              {placeholder || 'Select items...'}
            </div>
          )}
          {value.map((item) => (
            <SelectedItem
              key={item.value}
              item={item}
              deselectItem={() => deselectItem(item)}
            />
          ))}
          {/* Placeholder to maintain the height when items are empty */}
          <div className="tw-h-[30px]" />
        </div>
        {/* Show/hide dropdown toggle */}
        <div className="tw-text-sm tw-text-scale-600 tw-pl-2 tw-pr-2.5 tw-border-l tw-flex tw-items-center tw-justify-center tw-border-border tw-cursor-pointer">
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
          <div className="tw-absolute tw-shadow  tw-rounded-t-none tw-border-t-0 tw-bg-control tw-z-40 tw-w-full tw-rounded tw-overflow-hidden tw-border tw-border-border">
            <div className="scrollbar-no-borders tw-flex tw-flex-col tw-w-full tw-max-h-40 tw-overflow-y-auto">
              {items.map((item) => (
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
        value={value.map((el) => (el.name))}
        onChange={onChange}
        className="tw-hidden"
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
  const selected = value.includes(item)
  function toggleSelectItem() {
    const newValue = selected
      ? value.filter((i: SelectItem) => i !== item)
      : [...value, item]
    onChange({ target: { name, value: newValue } }) // Update Formik state
  }
  return (
    <div
      className="tw-cursor-pointer tw-w-full tw-border-b last:tw-border-b-0 hover:tw-bg-brand-400/50 tw-border-border   dark:hover:tw-bg-brand-600/40"
      onClick={toggleSelectItem}
      // For accessibility
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && toggleSelectItem()}
      tabIndex={0} // Make the div focusable
    >
      <div
        className={cn(
          'tw-flex tw-w-full tw-items-center tw-p-2 tw-pl-1 tw-border-transparent tw-border-l-2 tw-relative',
          { 'tw-border-brand-600 dark:tw-border-brand-400': selected },
        )}
      >
        <div className="tw-w-full tw-items-center tw-flex">
          <div className="tw-mx-2 tw-leading-6  ">{item.name}</div>
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
    <div className="tw-flex tw-justify-center tw-text-sm tw-font-normal tw-items-center tw-cursor-default tw-py-1 tw-px-2 tw-gap-1 tw-rounded-md tw-text-brand-550 tw-bg-brand-400/50 tw-border tw-border-brand-600/30 dark:tw-text-brand-200 dark:tw-border-brand-500 dark:tw-bg-brand-600/40">
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
        <FontAwesomeIcon icon={faTimes} className="tw-cursor-pointer" />
      </div>
    </div>
  )
}
