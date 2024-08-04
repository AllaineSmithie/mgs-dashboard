/*************************************************************************/
/*  usePaginationState.tsx                                               */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useState } from 'react'
import { PaginationCounterProps } from '../UI/Table/PaginationCounter'
import { PaginationProps as PaginationCompProps } from '../UI/Pagination'

export type PaginationState = {
  totalCount: number;
  setTotalCount: (c: number) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageCount: number;
  firstItemIndex: number;
  lastItemIndex: number;
  itemsPerPage: number;
  paginationCounterProps: PaginationCounterProps;
  paginationProps: Omit<PaginationCompProps, 'marginPagesDisplayed' | 'pageRangeDisplayed'>;
}

export default function usePaginationState(itemsPerPage = 50, onPageChange = () => {})
  : PaginationState {
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)

  const firstItemIndex = currentPage * itemsPerPage
  const lastItemIndex = ((currentPage + 1) * itemsPerPage) - 1

  return {
    totalCount,
    setTotalCount: (c: number) => {
      if (c !== totalCount) {
        setPageCount(Math.max(Math.ceil(c / itemsPerPage), 1))
        setTotalCount(c)
      }
    },
    currentPage,
    setCurrentPage,
    pageCount,
    firstItemIndex,
    lastItemIndex,
    itemsPerPage,
    paginationCounterProps: {
      from: totalCount === 0 ? 0 : firstItemIndex + 1,
      to: Math.min(lastItemIndex + 1, totalCount),
      total: totalCount,
    },
    paginationProps: {
      pageOffset: currentPage,
      pageCount,
      onPageChange: (p) => {
        setCurrentPage(p)
        if (onPageChange) {
          onPageChange()
        }
      },
    },
  }
}
