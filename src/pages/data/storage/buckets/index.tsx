/*************************************************************************/
/*  index.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import Button from '@webapps-common/UI/Button'
import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { Bucket } from '@supabase/storage-js'
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

export default function Buckets() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Data' }],
        breadcrumbCurrentText: 'Buckets',
      }}
    >
      <BucketList />
    </MainLayout>
  )
}

function BucketList() {
  const supabase = useSupabaseClient()

  const [bucketList, setBucketList] = useState<Array<Bucket>>([])

  const [totalCount, setTotalCount] = useState(0)

  // Modals
  const [bucketToCreateVisible, setBucketToCreateVisible] = useState(false)

  const [bucketToUpdate, setBucketToUpdate] = useState<BucketUpdated | undefined>()
  const [bucketToUpdateVisible, setBucketToUpdateVisible] = useState(false)

  const [bucketToDelete, setBucketToDelete] = useState<BucketDeleted | undefined>()
  const [bucketToDeleteVisible, setBucketToDeleteVisible] = useState(false)

  const fetchListElements = useCallback(async () => {
    const res = await supabase.storage.listBuckets()
    if (res.error) {
      toast.error(`Could not retrieve bucket list: ${res.error.message}`)
      return
    }
    const list = res.data || []

    setBucketList(list)
    setTotalCount(list.length)
  }, [supabase])

  useEffect(() => {
    fetchListElements()
  }, [fetchListElements])

  return (
    <div>
      <BucketCreate
        show={bucketToCreateVisible}
        onCancel={() => setBucketToCreateVisible(false)}
        onSuccess={() => {
          setBucketToCreateVisible(false)
          fetchListElements()
        }}
      />
      <BucketUpdate
        show={bucketToUpdateVisible}
        updated={bucketToUpdate}
        onCancel={() => setBucketToUpdateVisible(false)}
        onSuccess={() => {
          setBucketToUpdateVisible(false)
          fetchListElements()
        }}
      />
      <BucketDelete
        show={bucketToDeleteVisible}
        deleted={bucketToDelete}
        onCancel={() => setBucketToDeleteVisible(false)}
        onSuccess={() => {
          setBucketToDeleteVisible(false)
          fetchListElements()
        }}
      />
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
        <SimpleCounter total={totalCount} />

        <Button
          className="tw-block tw-w-fit"
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

      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell>Public</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {bucketList.map((listElement) => {
            const disableEdit = listElement.name
              === process.env.NEXT_PUBLIC_BUCKET_GAMESERVER_BUILD
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
              <Table.Row key={listElement.id} className="tw-cursor-pointer">
                <Table.DataCell>
                  <Link href={`/data/storage/buckets/${listElement.id}`}>
                    {listElement.name}
                  </Link>
                </Table.DataCell>
                <Table.DataCell>{listElement.owner || 'System'}</Table.DataCell>
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
    </div>
  )
}
