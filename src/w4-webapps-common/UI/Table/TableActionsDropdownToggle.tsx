/*************************************************************************/
/*  TableActionsDropdownToggle.tsx                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import Dropdown from '../Dropdown/Dropdown'
import cn from '../../utils/classNamesMerge'

type TableActionsDropdownToggleProps = {
  disabled?: boolean;
  className?: string;
} & React.PropsWithChildren

function TableActionsDropdownToggleRoot(
  { disabled, children, className }:TableActionsDropdownToggleProps,
) {
  return (
    <Dropdown className="w-8">
      <Dropdown.Toggle
        as="div"
        className={cn(
          'flex w-8 h-8 items-center justify-center rounded-full hover:bg-surface-200',
          disabled && 'dark:hover:bg-transparent cursor-default',
          className,
        )}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faEllipsisV} fixedWidth />
      </Dropdown.Toggle>
      <Dropdown.Menu placement="right">
        {children}
      </Dropdown.Menu>
    </Dropdown>
  )
}

const TableActionsDropdownToggle = Object.assign(TableActionsDropdownToggleRoot, {
  Item: Dropdown.Item,
})
export default TableActionsDropdownToggle
