/*************************************************************************/
/*  Header.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
} from '@fortawesome/free-solid-svg-icons'
import { ReactNode } from 'react'
import { BreadcrumbHeader, BreadcrumbHeaderProps } from './HeaderBreadcrumb'
import { HeaderNavDropdownMenu } from './HeaderNavDropdownMenu'
import Button from '../../Button'
import cn from '../../../utils/classNamesMerge'

export type HeaderProps = {
  breadcrumbProps?: BreadcrumbHeaderProps;
  navDropdownMenuContent: ReactNode | undefined;
  showToggleSidebar: boolean;
  toggleSidebar: () => void;
}
export function Header({
  breadcrumbProps,
  navDropdownMenuContent,
  showToggleSidebar,
  toggleSidebar,
}: HeaderProps) {
  return (
    <header className={
      cn(
        'tw-min-h-[4rem] tw-border-b-[1px] tw-border-b-border tw-flex tw-items-center tw-ps-8 tw-pe-4 tw-py-2',
        { 'tw-ps-4': showToggleSidebar },
      )
    }
    >
      <Button
        variant="no-background"
        className={cn('tw-px-4 tw-me-2 hover:tw-text-brand-200 tw-bg-transparent hover:tw-bg-transparent', {
          'tw-hidden': !showToggleSidebar,
        })}
        type="button"
        onClick={toggleSidebar}
      >
        <FontAwesomeIcon icon={faBars} />
      </Button>

      {breadcrumbProps
        && (
        <BreadcrumbHeader
          breadcrumb={breadcrumbProps.breadcrumb}
          breadcrumbCurrentText={breadcrumbProps.breadcrumbCurrentText}
        />
        )}
      <div className="tw-grow" />
      <div className="tw-ms-2">
        <HeaderNavDropdownMenu>
          {navDropdownMenuContent}
        </HeaderNavDropdownMenu>
      </div>
    </header>
  )
}
