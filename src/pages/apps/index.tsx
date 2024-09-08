/*************************************************************************/
/*  index.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import React, {
  useEffect, useState, useCallback,
} from 'react'
import Table from '@webapps-common/UI/Table/Table'
import Pagination from '@webapps-common/UI/Pagination'
import {
  useSupabaseClient,
} from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import AppCreate from '@components/Forms/Apps/AppCreate'
import MainLayout from '@components/MainLayout'
import Button from '@webapps-common/UI/Button'

export default function Apps() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'Apps',
      }}
    >
      <AppList />
    </MainLayout>
  )
}

function AppList({ itemsPerPage = 30 }) {
  const router = useRouter()
  // List counts
  const [pageOffset, setPageOffset] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Modals
  const [appCreateVisible, setAppCreateVisible] = useState(false)

  // Selected

  const supabase = useSupabaseClient()

  const fetchApps = useCallback(async () => {
    setPageCount(1)
    setTotalCount(0)
  }, [pageOffset, itemsPerPage, supabase])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  useEffect(() => {
  }, [router.query])

  return (
    <div>
      <AppCreate
        show={appCreateVisible}
        onClose={() => setAppCreateVisible(false)}
      />
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
        <div>
          Showing
          {' '}
          <span className="tw-font-semibold">{pageOffset * itemsPerPage}</span>
          {' '}
          to
          {' '}
          <span className="tw-font-semibold">{pageOffset + 0}</span>
          {' '}
          of
          {' '}
          <span className="tw-font-semibold">{totalCount}</span>
          {' '}
          results
        </div>

        <div className="tw-flex tw-gap-2">
          <Button
            onClick={() => {
              setAppCreateVisible(true)
            }}
            variant="secondary"
          >
            <FontAwesomeIcon icon={faPlus} fixedWidth />
            {' '}
            New app
          </Button>
        </div>
      </div>
      <Table>
        <Table.Header>
          <Table.HeaderRow>
            {['Name', 'Created', 'State'].map((label) => (
              <Table.HeaderCell key={label}>
                {label}
              </Table.HeaderCell>
            ))}
            <Table.HeaderCell className="tw-w-4" />
          </Table.HeaderRow>
        </Table.Header>
      </Table>
      <div className="tw-flex tw-justify-end tw-mt-3">
        <Pagination
          pageOffset={pageOffset}
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={(currentPage) => {
            setPageOffset(currentPage)
          }}
        />
      </div>
    </div>
  )
}
