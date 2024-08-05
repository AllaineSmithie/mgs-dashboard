/*************************************************************************/
/*  TableFilterCell.tsx                                                  */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCaretDown, faCaretUp, faCheck, faFilter,
} from '@fortawesome/free-solid-svg-icons'
import cn from '../../../utils/classNamesMerge'
import Dropdown from '../../Dropdown/Dropdown'
import { useSearchAndFilterContext } from './SearchAndFilterContextProvider'

type TableHeaderCellProps = {
  title: string;
  filterType: string;
  replace?: boolean;
  items: Item[];
  className?: string;
}

type Item = {
  name: string;
  value: string;
}

export default function TableFilterCell({
  title, filterType, replace, items, className,
}: TableHeaderCellProps) {
  const { setFilter, filters } = useSearchAndFilterContext()
  const sortedDescending = filters.includes(`sort:${filterType}-desc`)
  const sortedAscending = filters.includes(`sort:${filterType}-asc`)
  const filterIsActive = filters.find((f) => f.split(':')[0].includes(filterType))
  function toggleSort() {
    if (sortedDescending) {
      setFilter({ filterType: 'sort', filterValue: `${filterType}-asc`, replace: true })
    } else {
      setFilter({ filterType: 'sort', filterValue: `${filterType}-desc`, replace: true })
    }
  }
  return (
    <th
      scope="col"
      className={cn(
        'tw-px-3 tw-py-2 tw-text-left tw-font-semibold tw-text-secondary tw-group',
        className,
      )}
    >
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-2">
        <div
          className="tw-w-full tw-flex tw-items-center tw-justify-between tw-cursor-pointer hover:tw-text-foreground"
          onClick={() => toggleSort()}
          // For accessibility
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSort()}
        >
          <div className="tw-flex tw-gap-2 tw-items-center">
            {title}
            <div className="tw-flex tw-items-center tw-justify-center tw-h-5 tw-w-5 tw-rounded-full">
              {sortedAscending && <FontAwesomeIcon icon={faCaretUp} />}
              {sortedDescending && <FontAwesomeIcon icon={faCaretDown} />}
            </div>
          </div>
          <div className="tw-flex tw-gap-2">
            <div
              className={cn('tw-invisible group-hover:tw-visible', filterIsActive && 'tw-visible')}
            >
              <Dropdown
                onSelect={(selectedValue) => {
                  setFilter({ filterType, filterValue: selectedValue!.toString(), replace })
                }}
              >
                <Dropdown.Toggle
                  as="div"
                  variant="secondary"
                  className={cn('tw-flex tw-justify-between tw-items-center', className)}
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-h-7 tw-w-7 tw-rounded-full hover:tw-bg-surface-200 tw-text-xs">
                    <FontAwesomeIcon icon={faFilter} />
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu placement="right">
                  <Dropdown.Header>Filter by value:</Dropdown.Header>
                  {items.map((item) => (
                    <Dropdown.Item key={item.name} eventKey={item.value} className="tw-flex tw-gap-2 tw-pl-2">
                      <div className="tw-w-4">
                        {filters.includes(`${filterType}:${item.value}`) && <FontAwesomeIcon icon={faCheck} />}
                      </div>
                      <span>{item.name}</span>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </th>
  )
}
