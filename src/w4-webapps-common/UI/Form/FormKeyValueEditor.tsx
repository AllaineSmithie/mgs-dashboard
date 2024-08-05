/*************************************************************************/
/*  FormKeyValueEditor.tsx                                               */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useEffect, useState } from 'react'
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          'tw-flex tw-bg-control tw-border tw-border-border tw-rounded-md tw-p-1 tw-justify-between',
          showDropdown && 'tw-rounded-b-none',
          isInvalid && 'tw-border-danger-500 dark:tw-border-danger-500',
        )}
      >
        <div className="tw-flex tw-flex-wrap tw-gap-1">
          {items.length === 0 && (
            <div
              className="tw-text-foreground-muted tw-flex tw-items-center tw-pl-1"
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
          <div className="tw-h-[30px]" />
        </div>
        {/* Show/hide dropdown toggle */}
        <div
          className="tw-w-8 tw-flex-none tw-text-sm tw-text-foreground-muted tw-border-l tw-flex tw-items-center tw-justify-center tw-border-border tw-cursor-pointer"
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
    <div className="tw-flex tw-justify-center tw-text-sm tw-items-center tw-cursor-default tw-rounded-md tw-text-brand-500 tw-bg-brand-400/50 tw-border tw-border-brand-600/50 dark:tw-text-brand-200 dark:tw-border-brand-500 dark:tw-bg-brand-600/40 tw-whitespace-nowrap">
      <div
        className="tw-py-1 tw-px-2 tw-cursor-pointer"
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
      <div className="tw-py-1 tw-px-1 tw-cursor-pointer tw-border-l  tw-border-brand-600/50 tw-text-brand-500 dark:tw-text-brand-200/50 dark:tw-border-brand-500/50 hover:tw-text-brand-400 dark:hover:tw-text-brand-200 ">
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
  return (
    <div className="tw-flex tw-gap-1 tw-p-1 tw-bg-control tw-border tw-border-border tw-border-t-0 tw-rounded-b-md">
      <div className="tw-flex">
        <Dropdown className="tw-w-full">
          <Dropdown.Toggle as="div">
            <FormInput
              className="tw-rounded-r-none tw-border-r-[0.5px]"
              placeholder="Key..."
              value={formKey}
              onChange={(e) => setFormKey(e.target.value)}
              autoComplete="off"
            />
          </Dropdown.Toggle>
          {autofillKeys.length > 0 && (
            <Dropdown.Menu className="tw-mt-0 tw-max-h-40 tw-overflow-y-auto">
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
          className="tw-rounded-l-none tw-border-l-[0.5px]"
          placeholder="Value..."
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          autoComplete="off"
        />
      </div>
      <Button
        className="tw-py-1 tw-px-3"
        onClick={() => {
          addItem({ key: formKey, value: formValue })
          setFormKey('')
          setFormValue('')
        }}
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
