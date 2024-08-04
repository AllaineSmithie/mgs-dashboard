/*************************************************************************/
/*  FiltersDropdown.tsx                                                  */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { faCaretDown, faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cn from '../../../utils/classNamesMerge'
import Dropdown from '../../Dropdown/Dropdown'
import { useKeyValueSearchContext } from './KeyValueSearchContextProvider'

export type FiltersDropdownProps = {
  customFilters: CustomFilterItem[];
  className?: string;
}

export type CustomFilterItem = {
  name: string;
  type: string;
  value: string;
}

export default function FiltersDropdown({
  customFilters = [],
  className,
}: FiltersDropdownProps) {
  const { clearKeyValues, setKeyValue, keyValues } = useKeyValueSearchContext()

  return (
    <Dropdown
      onSelect={(selectedValue) => {
        if (selectedValue === 'clear') {
          clearKeyValues()
        } else {
          const [key, value] = selectedValue!.toString().split(':')
          setKeyValue({
            key,
            value,
            replace: false,
          })
        }
      }}
    >
      <Dropdown.Toggle variant="outline-secondary" className={cn('', className)}>
        Filters
        <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {customFilters.map((item: CustomFilterItem) => (
          <Dropdown.Item key={item.name} eventKey={`${item.type}:${item.value}`} className="flex gap-2 pl-2">
            {/* Checkmark indicating that the filter is toggled on */}
            <div className="w-4">
              {keyValues[item.type]?.includes(item.value) && (
              <FontAwesomeIcon icon={faCheck} />
              )}
            </div>
            <span>{item.name}</span>
          </Dropdown.Item>
        ))}
        <Dropdown.Item eventKey="clear" className="flex gap-2 pl-2">
          Clear filters
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
