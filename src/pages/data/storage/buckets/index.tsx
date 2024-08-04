/*************************************************************************/
/*  index.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import Button from '@webapps-common/UI/Button'
import React, {
  useState, useCallback, useRef,
} from 'react'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { Bucket, StorageError } from '@supabase/storage-js'
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SimpleCounter from '@webapps-common/UI/Table/SimpleCounter'
import MainLayout from '@components/MainLayout'
import BucketCreate from '@components/Forms/Buckets/BucketCreate'
import BucketUpdate, {
  BucketUpdated,
} from '@components/Forms/Buckets/BucketUpdate'
import BucketDelete, {
  BucketDeleted,
} from '@components/Forms/Buckets/BucketDelete'
import Tooltip from '@webapps-common/UI/Tooltip'

import {
  KeyValueSearchContextProvider,
  KeyValueSearchContextProviderRef,
  OnCompletedCallback,
  OnSearchCallback,
} from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchContextProvider'
import KeyValueSearchBar from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchBar'
import IdField from '@webapps-common/UI/IdField'

export default function Buckets() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Data' }],
        breadcrumbCurrentText: 'File Storage',
      }}
    >
      <BucketList />
    </MainLayout>
  )
}

function BucketList() {
  const supabase = useSupabaseClient()

  const [bucketList, setBucketList] = useState<Array<Bucket>>([])
  const [bucketsSortedAndFiltered, setBucketsSortedAndFiltered] = useState<Array<Bucket>>([])

  const [totalCount, setTotalCount] = useState(0)

  // Modals
  const [bucketToCreateVisible, setBucketToCreateVisible] = useState(false)

  const [bucketToUpdate, setBucketToUpdate] = useState<BucketUpdated | undefined>()
  const [bucketToUpdateVisible, setBucketToUpdateVisible] = useState(false)

  const [bucketToDelete, setBucketToDelete] = useState<BucketDeleted | undefined>()
  const [bucketToDeleteVisible, setBucketToDeleteVisible] = useState(false)

  // Ref to the key/value search context.
  const keyValueSearchContextProviderRef = useRef<KeyValueSearchContextProviderRef>(null)

  type ListBucketReturnType = {
    data: Bucket[];
    error: null;
  } | {
    data: null;
    error: StorageError;
  }

  const onSearch = useCallback<OnSearchCallback<ListBucketReturnType>>(() => (
    supabase.storage.listBuckets()
  ), [supabase])

  const onCompleted : OnCompletedCallback<ListBucketReturnType> = ({
    searchTerms,
    keyValues,
    result,
  }) => {
    if (result.error) {
      toast.error(`Could not retrieve bucket list: ${result.error.message}`)
      return
    }
    const list = result.data || []

    let items = bucketList
    // Filter by search terms
    if (searchTerms.length) {
      items = items.filter((item) => (
        searchTerms.some((term) => (
          item.name.toLowerCase().includes(term.toLocaleLowerCase())
        ))
      ))
    }
    // Filter table items
    if (keyValues.public) {
      items = items.filter((item) => keyValues.public?.includes(item.public.toString()))
    }
    // Sort table items
    if (keyValues.sort?.length === 1) {
      const [filterType, sortType] = keyValues.sort[0].split('-')
      switch (filterType) {
        case 'name':
          items = items.sort((a, b) => {
            if (sortType === 'asc') return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            return b.name.toLowerCase().localeCompare(a.name.toLowerCase())
          })
          break
        case 'public':
          items = items.sort((a) => {
            if (sortType === 'asc') return a.public ? -1 : 1
            return a.public ? 1 : -1
          })
          break
        default:
          break
      }
    }
    setBucketsSortedAndFiltered(items)

    setBucketList(list)
    setBucketsSortedAndFiltered(list)
    setTotalCount(list.length)
  }

  return (
    <div>
      <BucketCreate
        show={bucketToCreateVisible}
        onCancel={() => setBucketToCreateVisible(false)}
        onSuccess={() => {
          setBucketToCreateVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <BucketUpdate
        show={bucketToUpdateVisible}
        updated={bucketToUpdate}
        onCancel={() => setBucketToUpdateVisible(false)}
        onSuccess={() => {
          setBucketToUpdateVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <BucketDelete
        show={bucketToDeleteVisible}
        deleted={bucketToDelete}
        onCancel={() => setBucketToDeleteVisible(false)}
        onSuccess={() => {
          setBucketToDeleteVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <div className="flex items-center justify-between mb-3">
        <SimpleCounter total={totalCount} />

        <Button
          className="block w-fit"
          variant="primary"
          onClick={() => {
            setBucketToCreateVisible(true)
          }}
        >
          <FontAwesomeIcon icon={faPlus} fixedWidth />
          {' '}
          New Bucket
        </Button>
      </div>
      <KeyValueSearchContextProvider
        onSearch={onSearch}
        onCompleted={onCompleted}
        isResultAbortError={() => false}
        kvRef={keyValueSearchContextProviderRef}
      >
        <KeyValueSearchBar />
        <Table className="mt-2">
          <Table.Header>
            <Table.HeaderRow>
              <Table.SortAndFilterHeaderCell
                keyName="name"
                sortable
              >
                Bucket
              </Table.SortAndFilterHeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="public"
                sortable
                filterValueList={[
                  {
                    name: 'Public',
                    value: 'true',
                  },
                  {
                    name: 'Not public',
                    value: 'false',
                  },
                ]}
              >
                Public
              </Table.SortAndFilterHeaderCell>
              <Table.HeaderCell />
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {bucketsSortedAndFiltered.map((listElement) => {
              const disableEdit = [
                process.env.NEXT_PUBLIC_BUCKET_GAMESERVER_BUILD,
                process.env.NEXT_PUBLIC_BUCKET_WEB_BUILDS_PACKED,
                process.env.NEXT_PUBLIC_BUCKET_WEB_BUILDS_PUBLIC,
                process.env.NEXT_PUBLIC_BUCKET_WEB_BUILDS_PRIVATE,
              ].includes(listElement.name)
              const buttonGroup = (
                <Table.ActionsDropdownToggle disabled={disableEdit}>
                  <Table.ActionsDropdownToggle.Item
                    disabled={disableEdit}
                    onClick={(e) => {
                      e.stopPropagation()
                      setBucketToUpdate(listElement)
                      setBucketToUpdateVisible(true)
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} fixedWidth />
                    {' '}
                    Edit
                  </Table.ActionsDropdownToggle.Item>
                  <Table.ActionsDropdownToggle.Item
                    disabled={disableEdit}
                    onClick={(e) => {
                      e.stopPropagation()
                      setBucketToDelete(listElement)
                      setBucketToDeleteVisible(true)
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} fixedWidth />
                    {' '}
                    Delete
                  </Table.ActionsDropdownToggle.Item>
                </Table.ActionsDropdownToggle>
              )
              return (
                <Table.Row key={listElement.id} className="cursor-pointer">
                  <Table.DataCell>
                    <Link href={`/data/storage/buckets/${listElement.id}`}>
                      {listElement.name}
                    </Link>
                  </Table.DataCell>
                  <Table.DataCell>
                    {listElement.owner ? (
                      <IdField idValue={listElement.owner} />
                    ) : (
                      <span>System</span>
                    )}
                  </Table.DataCell>
                  <Table.DataCell>{listElement.public ? 'Yes' : 'No'}</Table.DataCell>
                  <Table.DataCell alignItems="right">
                    {disableEdit ? (
                      <Tooltip align="right" content="This is a system bucket, it cannot be edited.">
                        {buttonGroup}
                      </Tooltip>
                    ) : (
                      buttonGroup
                    )}
                  </Table.DataCell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </KeyValueSearchContextProvider>
    </div>
  )
}
