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
import { useSearchAndFilterContext } from './SearchAndFilterContextProvider'

type FiltersDropdownProps = {
  customFilters: CustomFilterItem[];
  className?: string;
}

type CustomFilterItem = {
  name: string;
  type: string;
  value: string;
}

export default function FiltersDropdown({
  customFilters = [], className,
}: FiltersDropdownProps) {
  const { setFilter, filters } = useSearchAndFilterContext()
  const clearFiltersItem = {
    name: 'Clear filters',
    type: 'clear-filters',
    value: 'true',
  }

  return (
    <Dropdown
      onSelect={(selectedValue) => {
        const [filterType, filterValue] = selectedValue!.toString().split(':')
        setFilter({ filterType, filterValue, replace: false })
      }}
    >
      <Dropdown.Toggle variant="outline-secondary" className={cn('', className)}>
        Filters
        <FontAwesomeIcon icon={faCaretDown} className="tw-ml-2" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {[clearFiltersItem, ...customFilters].map((item: CustomFilterItem) => (
          <Dropdown.Item key={item.name} eventKey={`${item.type}:${item.value}`} className="tw-flex tw-gap-2 tw-pl-2">
            {/* Checkmark indicating that the filter is toggled on */}
            <div className="tw-w-4">
              {filters.includes(`${item.type}:${item.value}`) && (
              <FontAwesomeIcon icon={faCheck} />
              )}
            </div>
            <span>{item.name}</span>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
