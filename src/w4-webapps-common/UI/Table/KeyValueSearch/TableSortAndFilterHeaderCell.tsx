/*************************************************************************/
/*  TableSortAndFilterHeaderCell.tsx                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCaretDown, faCaretUp, faCheck, faFilter,
} from '@fortawesome/free-solid-svg-icons'
import { PropsWithChildren, ThHTMLAttributes } from 'react'
import cn from '../../../utils/classNamesMerge'
import Dropdown from '../../Dropdown/Dropdown'
import { useKeyValueSearchContext } from './KeyValueSearchContextProvider'

type FilterValue = {
  name: string;
  value: string;
}

type TableHeaderCellProps = {
  keyName: string;
  filterValueList?: FilterValue[];
  multiple?: boolean;
  className?: string;
  sortable?: boolean;
  sortDescByDefault?: boolean;
} & Omit<ThHTMLAttributes<HTMLTableCellElement>, 'scope'> & PropsWithChildren

export default function TableSortAndFilterHeaderCell({
  keyName,
  filterValueList,
  multiple,
  sortable = false,
  sortDescByDefault = false,
  className,
  children,
  ...props
}: TableHeaderCellProps) {
  const { setKeyValue, keyValues } = useKeyValueSearchContext()
  const sortedDescending = keyValues.sort?.includes(`${keyName}-desc`)
  const sortedAscending = keyValues.sort?.includes(`${keyName}-asc`)
  const notSorted = !sortedDescending && !sortedAscending
  const filterIsActive = keyValues[keyName]?.length > 0
  function toggleSort() {
    if (!sortable) return
    if (notSorted) {
      if (sortDescByDefault) {
        setKeyValue({ key: 'sort', value: `${keyName}-desc`, replace: true })
      } else {
        setKeyValue({ key: 'sort', value: `${keyName}-asc`, replace: true })
      }
    } else if (sortedAscending) {
      setKeyValue({ key: 'sort', value: `${keyName}-desc`, replace: true })
    } else {
      setKeyValue({ key: 'sort', value: `${keyName}-asc`, replace: true })
    }
  }
  return (
    <th
      scope="col"
      className={cn(
        'ps-3 py-2 text-left font-semibold text-secondary group',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            'w-full flex items-center justify-between',
            sortable
              ? 'cursor-pointer hover:text-foreground'
              : 'cursor-default',
          )}
          onClick={() => toggleSort()}
          // For accessibility
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSort()}
        >
          <div className="flex gap-2 items-center">
            {children}
            <div className="flex items-center justify-center h-5 w-5 roundetd-full">
              {sortedAscending && <FontAwesomeIcon icon={faCaretDown} />}
              {sortedDescending && <FontAwesomeIcon icon={faCaretUp} />}
            </div>
          </div>
          {filterValueList && (
          <div
            className={cn('invisible group-hover:visible', filterIsActive && 'visible')}
          >
            <Dropdown
              onSelect={(selectedValue) => {
                setKeyValue({
                  key: keyName,
                  value: selectedValue!.toString(),
                  replace: !multiple,
                })
              }}
            >
              <Dropdown.Toggle
                as="div"
                variant="secondary"
                className={cn('flex justify-between items-center', className)}
              >
                <div className="flex items-center justify-center h-7 w-7 rounded-full hover:bg-surface-200 text-xs">
                  <FontAwesomeIcon icon={faFilter} />
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu placement="right">
                <Dropdown.Header>Filter by value:</Dropdown.Header>
                {filterValueList.map((item) => (
                  <Dropdown.Item key={item.name} eventKey={item.value} className="flex gap-2 pl-2">
                    <div className="w-4">
                      {keyValues[keyName]?.includes(item.value) && (
                      <FontAwesomeIcon icon={faCheck} />
                      )}
                    </div>
                    <span>{item.name}</span>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          )}
        </div>
      </div>
    </th>
  )
}
