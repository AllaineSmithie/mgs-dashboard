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
    <Dropdown className="tw-w-8">
      <Dropdown.Toggle
        as="div"
        className={cn(
          'tw-flex tw-w-8 tw-h-8 tw-items-center tw-justify-center tw-rounded-full hover:tw-bg-surface-200',
          disabled && 'dark:hover:tw-bg-transparent tw-cursor-default',
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
