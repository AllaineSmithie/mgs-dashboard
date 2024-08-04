/*************************************************************************/
/*  FormKeyValueEditor.tsx                                               */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

/* eslint-disable react/jsx-no-bind */
import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronUp,
  faTimes,
  faEdit,
  faPlus,
  faSave,
} from '@fortawesome/free-solid-svg-icons'
import { FormikErrors } from 'formik'
import cn from '../../utils/classNamesMerge'
import { useFormGroup } from './FormGroup'
import Button from '../Button'
import { FormInput } from './FormControl'
import Dropdown from '../Dropdown/Dropdown'

type FormKeyValueInputProps = {
  name: string;
  defaultValue: string;
  setFieldValue: (
    field: string,
    value: string,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<object>>;
  isInvalid?: boolean;
  dropdownKeys?: string[];
}
type Item = {
  key: string;
  value: string;
}

// Must be placed inside the Form.Group component
// (so that it could tell the Form.Group when isInvalid is true)
export default function FormKeyValueEditor({
  name,
  defaultValue,
  setFieldValue,
  isInvalid,
  dropdownKeys,
}: FormKeyValueInputProps) {
  const [formKey, setFormKey] = useState('')
  const [formValue, setFormValue] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [showDropdown, setShowDropdown] = useState<boolean>(false)

  // Set the Form.Group's context's when isInvalid prop changes
  const { setIsInvalid } = useFormGroup()
  useEffect(() => {
    if (isInvalid) {
      setIsInvalid(isInvalid)
    }
  }, [isInvalid, setIsInvalid])

  // Convert default value to initial items
  useEffect(() => {
    if (Object.keys(JSON.parse(defaultValue)).length > 0 && items.length === 0) {
      const jsonObject = JSON.parse(defaultValue)
      const initialItems = Object.keys(jsonObject).map((key) => ({
        key,
        value: jsonObject[key],
      }))
      setItems(initialItems)
    }
  }, [defaultValue])

  // When the items change, update the form value
  useEffect(() => {
    function sortItems(unsortedItems: Item[]) {
      return unsortedItems.sort((a, b) => a.key.localeCompare(b.key))
    }
    function updateFormValue() {
      // Sort items by key before updating the form value
      const sortedItems = sortItems(items)
      // Turn items from array of keys-values into a json object with keys and values
      const jsonObject = sortedItems.reduce<{ [key: string]: string }>((acc, item) => {
        acc[item.key] = item.value
        return acc
      }, {})
      setFieldValue(name, JSON.stringify(jsonObject))
    }
    setItems((prev) => sortItems(prev))
    updateFormValue()
  }, [items])

  function addItem(newItem: Item) {
    setItems((prev) => {
      const updatedItems = JSON.parse(JSON.stringify(prev))
      const existingItem = updatedItems.find((i: Item) => i.key === newItem.key)
      if (existingItem) {
        existingItem.value = newItem.value
      } else {
        updatedItems.push(newItem)
      }
      return updatedItems
    })
  }

  function removeItem(item: Item) {
    setItems((prev) => prev.filter((i) => i.key !== item.key))
  }

  function toggleDropdown() {
    setShowDropdown((prev) => !prev)
  }

  return (
    <div>
      <div
        className={cn(
          'flex bg-control border border-border rounded-md p-1 justify-between',
          showDropdown && 'rounded-b-none',
          isInvalid && 'border-danger-500 dark:border-danger-500',
        )}
      >
        <div className="flex flex-wrap gap-1">
          {items.length === 0 && (
            <div
              className="text-foreground-muted flex items-center pl-1"
              onClick={toggleDropdown}
              // For accessibility
              role="button"
              onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
              tabIndex={0} // Make the div focusable
            >
              Add values...
            </div>
          )}
          {items.map((item) => (
            <SelectedItem
              key={item.key}
              item={item}
              removeItem={() => removeItem(item)}
              setFormKey={setFormKey}
              setFormValue={setFormValue}
              setShowDropdown={setShowDropdown}
              showDropdown={showDropdown}
            />
          ))}
          {/* Placeholder to maintain the height when items are empty */}
          <div className="h-[30px]" />
        </div>
        {/* Show/hide dropdown toggle */}
        <div
          className="w-8 flex-none text-sm text-foreground-muted border-l flex items-center justify-center border-border cursor-pointer"
          onClick={toggleDropdown}
          // For accessibility
          role="button"
          onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
          tabIndex={0} // Make the div focusable
        >
          {showDropdown ? (
            <FontAwesomeIcon icon={faChevronUp} />
          ) : (
            <FontAwesomeIcon icon={faEdit} />
          )}
        </div>
      </div>
      {showDropdown && (
        <AddItemForm
          items={items}
          formKey={formKey}
          setFormKey={setFormKey}
          formValue={formValue}
          setFormValue={setFormValue}
          dropdownKeys={dropdownKeys}
          // eslint-disable-next-line react/jsx-no-bind
          addItem={addItem}
        />
      )}
    </div>
  )
}

type SelectedItemProps = {
  item: Item;
  removeItem: () => void;
  setFormKey: (key: string) => void;
  setFormValue: (value: string) => void;
  setShowDropdown: (show: boolean) => void;
  showDropdown: boolean;
}

function SelectedItem({
  item,
  removeItem,
  setFormKey,
  setFormValue,
  setShowDropdown,
  showDropdown,
}: SelectedItemProps) {
  function editItem() {
    setFormKey(item.key)
    setFormValue(item.value)
    setShowDropdown(true)
  }
  return (
    <div className="flex justify-center text-sm items-center cursor-default rounded-md text-brand-500 bg-brand-400/50 border border-brand-600/50 dark:text-brand-200 dark:border-brand-500 dark:bg-brand-600/40 whitespace-nowrap">
      <div
        className="py-1 px-2 cursor-pointer"
        onClick={editItem}
        // For accessibility
        role="button"
        onKeyDown={(e) => e.key === 'Enter' && editItem()}
        tabIndex={0} // Make the div focusable
      >
        {item.key}
        :
        {item.value}
      </div>
      {showDropdown && (
      <div className="py-1 px-1 cursor-pointer border-l  border-brand-600/50 text-brand-500 dark:text-brand-200/50 dark:border-brand-500/50 hover:text-brand-400 dark:hover:text-brand-200 ">
        <FontAwesomeIcon icon={faTimes} onClick={() => removeItem()} />
      </div>
      )}
    </div>
  )
}

type AddItemFormProps = {
  items: Item[];
  addItem: (item: Item) => void;
  formKey: string;
  setFormKey: (key: string) => void;
  formValue: string;
  setFormValue: (value: string) => void;
  dropdownKeys?: string[];
}

function AddItemForm({
  items,
  addItem,
  formKey,
  setFormKey,
  formValue,
  setFormValue,
  dropdownKeys = [],
}: AddItemFormProps) {
  let autofillKeys: string[] = dropdownKeys
  autofillKeys = autofillKeys.filter((k) => k.includes(formKey))
  autofillKeys = autofillKeys.filter((k) => !items.find((i) => i.key === k))
  autofillKeys = autofillKeys.filter((k) => k !== formKey)
  autofillKeys = autofillKeys.sort((a, b) => a.localeCompare(b))
  const keyAlreadyExists = items.find((i) => i.key === formKey)
  const keyRef = useRef<HTMLInputElement>(null)
  const valueRef = useRef<HTMLInputElement>(null)

  // When both inputs lose focus, save the item
  const onBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    const { relatedTarget } = e // This is the element that is being focused next
    const isKeyFocused = keyRef.current?.contains(relatedTarget)
    const isValueFocused = valueRef.current?.contains(relatedTarget)
    if (!isKeyFocused && !isValueFocused) {
      save()
    }
  }

  function save() {
    if (!formKey || !formValue) return
    addItem({ key: formKey, value: formValue })
    setFormKey('')
    setFormValue('')
  }

  return (
    <div className="flex gap-1 p-1 bg-control border border-border border-t-0 rounded-b-md">
      <div className="flex">
        <Dropdown className="w-full">
          <Dropdown.Toggle as="div">
            <FormInput
              ref={keyRef}
              className="rounded-r-none border-r-[0.5px]"
              placeholder="Key..."
              value={formKey}
              onChange={(e) => setFormKey(e.target.value)}
              onBlur={onBlurHandler}
              autoComplete="off"
            />
          </Dropdown.Toggle>
          {autofillKeys.length > 0 && (
            <Dropdown.Menu className="mt-0 max-h-40 overflow-y-auto">
              {autofillKeys.map((autofillKey: string) => (
                <Dropdown.Item
                  key={autofillKey}
                  onClick={() => setFormKey(autofillKey)}
                >
                  {autofillKey}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        </Dropdown>
        <FormInput
          ref={valueRef}
          className="rounded-l-none border-l-[0.5px]"
          placeholder="Value..."
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          onBlur={onBlurHandler}
          autoComplete="off"
        />
      </div>
      <Button
        className="py-1 px-3"
        onClick={save}
        disabled={!formKey || !formValue}
      >
        {keyAlreadyExists ? (
          <>
            <FontAwesomeIcon icon={faSave} />
            Save
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faPlus} />
            Add
          </>
        )}
      </Button>
    </div>
  )
}
