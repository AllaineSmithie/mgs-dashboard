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
// import { toast } from 'react-toastify'
import {
  useSessionContext,
  useSupabaseClient,
} from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import humanizeDuration from 'humanize-duration'
// import { User } from '@supabase/gotrue-js'
// import { addBasePath } from 'next/dist/client/add-base-path'
import ProductCreate from '@components/Forms/Products/ProductCreate'
import MainLayout from '@components/MainLayout'
// import withUserTokenAuthAdmin from 'src/utils/withUserTokenAuthAdmin'
import Button from '@webapps-common/UI/Button'

export default function Products() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'Products',
      }}
    >
      <ProductList />
    </MainLayout>
  )
}

function ProductList({ itemsPerPage = 30 }) {
  const router = useRouter()
  // const sessionContext = useSessionContext()
  // const [products, setProducts] = useState<(Product & { banned_until?: string })[]>([])

  // List counts
  const [pageOffset, setPageOffset] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Modals
  const [productCreateVisible, setProductCreateVisible] = useState(false)

  // Selected
  // const [selected, setSelected] = useState<string>('')

  const supabase = useSupabaseClient()

  const fetchProducts = useCallback(async () => {
    // const supabaseAuthAdmin = await withUserTokenAuthAdmin(supabase)
    // const res = await supabaseAuthAdmin.listUsers({
    //  page: pageOffset + 1,
    //  perPage: itemsPerPage,
    // })
    // if (res.error) {
    //  toast.error(`Could not access user list: ${res.error?.message}`)
    //  setProducts([])
    setPageCount(1)
    setTotalCount(0)
    // return
    // }
    // setProducts(res.data.users)
    // setPageCount(res.data.lastPage)
    // setTotalCount(res.data.total)
  }, [pageOffset, itemsPerPage, supabase])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    const selectedFromQuery = router.query?.selected as string
    // if (selectedFromQuery) {
    //  setSelected(selectedFromQuery)
    // }
  }, [router.query])

  // const dateFormat = (dateTimestamp: string) => {
    // const date = DateTime.fromISO(dateTimestamp)
    // const diff = DateTime.now().diff(date)
    // return `${date.toFormat('kkkk-MM-dd')} at ${date.toFormat('HH:mm')} (${
    //   humanizeDuration(diff.toMillis(), {
    //     largest: 1,
    //     round: true,
    //     units: ['y', 'd', 'h', 'm', 's'],
    //   })} ago )`
  // }

  // const isBanned = (bannedUntil: string) => {
  //   if (!bannedUntil) {
  //     return false
  //   }
  //   const bannedUntildate = DateTime.fromISO(bannedUntil)
  // TODO: ideally, check against the server time instead, but requires changes to gotrue-js
  //   return bannedUntildate > DateTime.now()
  // }

  return (
    <div>
      <ProductCreate
        show={productCreateVisible}
        onClose={() => setProductCreateVisible(false)}
        // onSave={() => {
        //   setProductCreateVisible(false)
        //  fetchProduct()
        // }}
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
              setProductCreateVisible(true)
            }}
            variant="secondary"
          >
            <FontAwesomeIcon icon={faPlus} fixedWidth />
            {' '}
            New product
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
        <Table.Body>
        </Table.Body>
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
