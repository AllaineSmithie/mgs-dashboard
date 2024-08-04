/*************************************************************************/
/*  Pagination.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { PropsWithChildren } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import cn from '../utils/classNamesMerge'

export type PaginationProps = {
  pageOffset: number;
  pageCount: number;
  marginPagesDisplayed?: number;
  pageRangeDisplayed?: number;
  autoHide?: boolean;
  onPageChange: (currentPage: number) => void;
  className?: string;
}

export default function Pagination({
  pageOffset,
  pageCount,
  pageRangeDisplayed = 3,
  marginPagesDisplayed = 1,
  autoHide = true,
  onPageChange,
  className = '',
}: PaginationProps) {
  const currentPage = pageOffset + 1
  const pagesAroundCurrent = Math.floor(pageRangeDisplayed / 2)

  function getPageNumbers() {
    const pageNumbers = []
    // Add the starting pages
    for (let i = 1; i <= marginPagesDisplayed && i <= pageCount; i++) {
      pageNumbers.push(i.toString())
    }
    // Add the ellipsis, if needed
    if (currentPage > marginPagesDisplayed + pagesAroundCurrent + 1) {
      pageNumbers.push('ellipsis-before')
    }
    // Add the range around the current page
    const startRange = Math.max(marginPagesDisplayed + 1, currentPage - pagesAroundCurrent)
    const endRange = Math.min(pageCount - marginPagesDisplayed, currentPage + pagesAroundCurrent)
    for (let i = startRange; i <= endRange; i++) {
      pageNumbers.push(i.toString())
    }
    // Add the ellipsis, if needed
    if (currentPage < pageCount - marginPagesDisplayed - pagesAroundCurrent) {
      pageNumbers.push('ellipsis-after')
    }
    // Add the ending pages
    for (let i = pageCount - marginPagesDisplayed + 1; i <= pageCount; i++) {
      pageNumbers.push(i.toString())
    }
    // Removes duplicates
    return pageNumbers.filter((num, index, self) => self.indexOf(num) === index)
  }

  if (autoHide && pageCount <= 1) {
    return null
  }

  return (
    <div className={cn(
      'inline-flex rounded-md overflow-hidden border border-solid border-border',
      className,
    )}
    >
      <PageButton
        disabled={pageOffset === 0}
        onClick={() => onPageChange(pageOffset - 1)}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </PageButton>
      {getPageNumbers().map((pageNumber) => (
        <PageButton
          // Adding ${currentPage} forces the buttons to fully rerender,
          // which prevents the rendering glitch
          key={`${pageNumber}-${currentPage}`}
          disabled={pageNumber.includes('ellipsis')}
          active={currentPage.toString() === pageNumber}
          onClick={() => onPageChange(parseInt(pageNumber, 10) - 1)}
        >
          {pageNumber.includes('ellipsis') ? '...' : pageNumber}
        </PageButton>
      ))}
      <PageButton disabled={currentPage === pageCount} onClick={() => onPageChange(pageOffset + 1)}>
        <FontAwesomeIcon icon={faChevronRight} />
      </PageButton>
    </div>
  )
}

type PageButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
} & PropsWithChildren

function PageButton({
  children, onClick, disabled = false, active = false,
}: PageButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'flex justify-center items-center w-9 h-9 border-0 border-solid border-r last:border-r-0 bg-transparent border-border hover:bg-surface-2/30',
        active
          && 'bg-brand-600 text-white hover:bg-brand-600 cursor-default',
        disabled && 'hover:bg-transparent',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
