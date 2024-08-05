/*************************************************************************/
/*  builds.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import Button from '@webapps-common/UI/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronRight,
  faEdit,
  faTrash,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import prettyBytes from 'pretty-bytes'
import MainLayout from '@components/MainLayout'
import SimpleCounter from '@webapps-common/UI/Table/SimpleCounter'
import { GraphDefs } from '@components/Graphs'
import withSchema from 'src/utils/withSchema'
import JSONPanel from '@components/JSON/JSONPanel'
import BuildCreate from '@components/Forms/Builds/BuildCreate'
import BuildUpdate, {
  BuildUpdated,
} from '@components/Forms/Builds/BuildUpdate'
import BuildDelete, {
  BuildDeleted,
} from '@components/Forms/Builds/BuildDelete'

export default function Builds() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Multiplayer' }],
        breadcrumbCurrentText: 'Builds',
      }}
    >
      <GraphDefs />
      <BuildList />
    </MainLayout>
  )
}

export type Build = {
  id: string;
  name: string;
  object_name: string;
  object_metadata: {
    eTag?: string;
    size?: number;
    mimetype?: string;
    cacheControl?: string;
    lastModifed?: string;
    contentLength?: number;
    httpStatusCode?: number;
  };
  props: object;
}
function BuildList() {
  const [listElements, setListElements] = useState<Build[]>([])

  const [expanded, setExpanded] = useState<string>('')

  const [totalCount, setTotalCount] = useState(0)

  // Modals
  const [buildCreateVisible, setBuildCreateVisible] = useState(false)

  const [buildUpdated, setBuildUpdated] = useState<BuildUpdated | undefined>()
  const [buildUpdateVisible, setBuildUpdateVisible] = useState(false)

  const [buildDeleted, setBuildDeleted] = useState<BuildDeleted | undefined>()
  const [buildDeleteVisible, setBuildDeleteVisible] = useState(false)

  const supabase = useSupabaseClient()

  const fetchListElements = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online').rpc(
      'gameserver_build_get_all',
    )
    if (res.error) {
      toast.error(`Request failed: ${res.error?.message}`)
      setListElements([])
      return
    }
    setListElements(res.data as Build[])

    // Pagination
    setTotalCount(res.data.length)
  }, [supabase])

  useEffect(() => {
    fetchListElements()
  }, [fetchListElements])

  return (
    <div>
      <BuildCreate
        show={buildCreateVisible}
        onClose={() => {
          setBuildCreateVisible(false)
        }}
        onSave={() => {
          setBuildCreateVisible(false)
          fetchListElements()
        }}
      />
      <BuildUpdate
        show={buildUpdateVisible}
        updated={buildUpdated}
        onClose={() => {
          setBuildUpdateVisible(false)
        }}
        onSave={() => {
          setBuildUpdateVisible(false)
          fetchListElements()
        }}
      />
      <BuildDelete
        show={buildDeleteVisible}
        deleted={buildDeleted}
        onCancel={() => setBuildDeleteVisible(false)}
        onSuccess={() => {
          setBuildDeleteVisible(false)
          fetchListElements()
        }}
      />

      <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
        <SimpleCounter total={totalCount} />

        <Button
          variant="primary"
          onClick={() => {
            setBuildCreateVisible(true)
          }}
        >
          <FontAwesomeIcon icon={faPlus} fixedWidth />
          {' '}
          New Build
        </Button>
      </div>

      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell style={{ width: '2%' }}> </Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>File</Table.HeaderCell>
            <Table.HeaderCell className="tw-w-4" />
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {listElements.map((listElement) => [
            <Table.Row
              key={listElement.id}
              onClick={() => {
                setExpanded(expanded === listElement.id ? '' : listElement.id)
              }}
              aria-controls="example-collapse-text"
              aria-expanded={expanded === listElement.id}
              style={{ cursor: 'pointer' }}
            >
              <Table.DataCell>
                {expanded === listElement.id ? (
                  <FontAwesomeIcon icon={faChevronDown} fixedWidth />
                ) : (
                  <FontAwesomeIcon icon={faChevronRight} fixedWidth />
                )}
              </Table.DataCell>
              <Table.DataCell>
                <b>{listElement.name}</b>
              </Table.DataCell>
              <Table.DataCell>
                {listElement.object_name}
                {' '}
                {listElement.object_metadata.size
                  && `(${prettyBytes(listElement.object_metadata.size)})`}
              </Table.DataCell>
              <Table.DataCell alignItems="right">
                <Table.ActionsDropdownToggle>
                  <Table.ActionsDropdownToggle.Item onClick={(e) => {
                    e.stopPropagation()
                    setBuildUpdated({
                      ...listElement,
                      props: JSON.stringify(listElement.props, null, 2),
                    })

                    setBuildUpdateVisible(true)
                  }}
                  >
                    <FontAwesomeIcon icon={faEdit} fixedWidth />
                    {' '}
                    Edit
                  </Table.ActionsDropdownToggle.Item>
                  <Table.ActionsDropdownToggle.Item onClick={(e) => {
                    e.stopPropagation()
                    setBuildDeleted(listElement)
                    setBuildDeleteVisible(true)
                  }}
                  >
                    <FontAwesomeIcon icon={faTrash} fixedWidth />
                    {' '}
                    Delete
                  </Table.ActionsDropdownToggle.Item>
                </Table.ActionsDropdownToggle>
              </Table.DataCell>
            </Table.Row>,
            <Table.CollapsibleRow
              key={`${listElement.id}-collapsible`}
              colCount={7}
              expanded={expanded === listElement.id}
              id={`collapsible-${listElement.id}`}
            >
              <div className="tw-p-6">
                <span className="tw-font-bold">Properties:</span>
                <div className="tw-mt-2">
                  {listElement.props ? (
                    <JSONPanel value={listElement.props} />
                  ) : (
                    'This lobby has no properties.'
                  )}
                </div>
              </div>
            </Table.CollapsibleRow>,
          ])}
        </Table.Body>
      </Table>
    </div>
  )
}
