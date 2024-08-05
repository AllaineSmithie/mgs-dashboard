/*************************************************************************/
/*  fleets.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import SimpleCounter from '@webapps-common/UI/Table/SimpleCounter'
import Button from '@webapps-common/UI/Button'
import Badge from '@webapps-common/UI/Badge'
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
import { useRouter } from 'next/router'
import { ReplicasCountGraph, GraphDefs } from '@components/Graphs'
import withSchema from 'src/utils/withSchema'
import MainLayout from '@components/MainLayout'

import FleetCreate from '@components/Forms/Fleet/FleetCreate'
import FleetUpdate, { FleetUpdated } from '@components/Forms/Fleet/FleetUpdate'
import FleetDelete, { FleetDeleted } from '@components/Forms/Fleet/FleetDelete'
import cn from '@webapps-common/utils/classNamesMerge'

export default function Fleets() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Multiplayer' }],
        breadcrumbCurrentText: 'Fleets',
      }}
    >
      <GraphDefs />
      <FleetList />
    </MainLayout>
  )
}

export type Fleet = {
  name: string;
  description: string;
  cluster: string;
  port: number;
  build_id: string | null;
  image: string | null;
  labels: {
    [id: string]: string;
  };
  env: {
    [id: string]: string;
  };
  in_use: number;
  nb_replicas: number;
  min_replicas: number;
  max_replicas: number;
  buffer_size: number;
  autoscaling_interval: number;
  deleted: boolean;
}
function FleetList() {
  const router = useRouter()
  const [fleetList, setFleetList] = useState<Fleet[]>([])

  const [expanded, setExpanded] = useState<string>('')

  const [totalCount, setTotalCount] = useState(0)

  // Modals
  const [fleetCreateVisible, setFleetCreateVisible] = useState<boolean>(false)

  const [fleetToUpdate, setFleetToUpdate] = useState<
  FleetUpdated | undefined
  >()
  const [fleetUpdateVisible, setFleetUpdateVisible] = useState<boolean>(false)

  const [fleetToDelete, setFleetToDeleted] = useState<FleetDeleted>()
  const [fleetDeleteVisible, setFleetDeleteVisible] = useState<boolean>(false)

  const supabase = useSupabaseClient()

  const fetchListElements = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online').rpc('fleet_get_all')
    if (res.error) {
      toast.error(`Request failed: ${res.error?.message}`)
      setFleetList([])
      return
    }
    const rawFleetList = res.data as Fleet[]
    rawFleetList.sort((a, b) => {
      if (a.deleted === b.deleted) {
        return a.name.localeCompare(b.name)
      }
      return a.deleted > b.deleted ? 1 : -1
    })
    setFleetList(rawFleetList)

    // Pagination
    setTotalCount(res.data ? res.data.length : 0)
  }, [supabase])

  useEffect(() => {
    fetchListElements()
  }, [fetchListElements])

  useEffect(() => {
    const selected = router.query?.selected
    if (selected) {
      setExpanded(selected as string)
    }
  }, [router.query])

  // List of label keys from all the fleets, to autocomplete the labels in the KeyValueEditor
  let fleetLabelsKeys: string[] = []
  // eslint-disable-next-line no-restricted-syntax
  for (const fleet of fleetList) {
    const fleetKeys = Object.keys(fleet.labels)
    fleetLabelsKeys = fleetLabelsKeys.concat(
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      fleetKeys.filter((k) => !fleetLabelsKeys.includes(k)),
    )
  }

  return (
    <div>
      <FleetCreate
        show={fleetCreateVisible}
        onClose={() => setFleetCreateVisible(false)}
        onSave={() => {
          setFleetCreateVisible(false)
          fetchListElements()
        }}
        fleetLabelsKeys={fleetLabelsKeys}
      />
      <FleetUpdate
        show={fleetUpdateVisible}
        updated={fleetToUpdate}
        onClose={() => setFleetUpdateVisible(false)}
        onSave={() => {
          setFleetUpdateVisible(false)
          fetchListElements()
        }}
        fleetLabelsKeys={fleetLabelsKeys}
      />
      <FleetDelete
        show={fleetDeleteVisible}
        deleted={fleetToDelete}
        onCancel={() => setFleetDeleteVisible(false)}
        onSuccess={() => {
          setFleetDeleteVisible(false)
          fetchListElements()
        }}
      />

      <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
        <SimpleCounter total={totalCount} />

        <Button
          variant="primary"
          onClick={() => {
            setFleetCreateVisible(true)
          }}
        >
          <FontAwesomeIcon icon={faPlus} fixedWidth />
          {' '}
          New Fleet
        </Button>
      </div>

      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell style={{ width: '2%' }}> </Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Cluster</Table.HeaderCell>
            <Table.HeaderCell>Labels</Table.HeaderCell>
            <Table.HeaderCell>Occupancy rate</Table.HeaderCell>
            <Table.HeaderCell className="tw-w-4" />
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {fleetList.map((listElement) => {
            const result = [
              <Table.Row
                key={listElement.name}
                aria-controls="example-collapse-text"
                aria-expanded={expanded === listElement.name}
                style={!listElement.deleted ? { cursor: 'pointer' } : {}}
                className={cn('tw-h-12', { 'tw-text-scale-500': listElement.deleted })}
                onClick={() => {
                  if (!listElement.deleted) {
                    setExpanded(
                      expanded === listElement.name ? '' : listElement.name,
                    )
                  }
                }}
              >
                {listElement.deleted ? (
                  <Table.DataCell> </Table.DataCell>
                ) : (
                  <Table.DataCell onClick={() => {
                    if (!listElement.deleted) {
                      setExpanded(
                        expanded === listElement.name ? '' : listElement.name,
                      )
                    }
                  }}
                  >
                    {expanded === listElement.name ? (
                      <FontAwesomeIcon icon={faChevronDown} fixedWidth />
                    ) : (
                      <FontAwesomeIcon icon={faChevronRight} fixedWidth />
                    )}
                  </Table.DataCell>
                )}
                <Table.DataCell>
                  <b>
                    {listElement.deleted ? (
                      <>
                        {listElement.name}
                        {' '}
                        (deleted)
                      </>
                    ) : (
                      listElement.name
                    )}
                  </b>
                </Table.DataCell>
                <Table.DataCell>{listElement.cluster}</Table.DataCell>
                <Table.DataCell>
                  {Object.keys(listElement.labels).map((key) => (
                    <Badge
                      className="tw-mr-1"
                      key={`${key}-${listElement.labels[key]}`}
                      bg="primary"
                    >
                      {key}
                      :
                      {String(listElement.labels[key])}
                    </Badge>
                  ))}
                </Table.DataCell>
                <Table.DataCell className="tw-w-56">
                  {listElement.in_use}
                  {' '}
                  /
                  {listElement.max_replicas}
                  {' '}
                  - (
                  {Math.trunc(
                    (listElement.in_use / listElement.max_replicas) * 100,
                  )}
                  %)
                </Table.DataCell>
                <Table.DataCell>
                  {!listElement.deleted && (
                    <Table.ActionsDropdownToggle>
                      <Table.ActionsDropdownToggle.Item onClick={(e) => {
                        e.stopPropagation()
                        setFleetToUpdate({
                          ...listElement,
                          labels: JSON.stringify(listElement.labels, null, 2),
                          env: JSON.stringify(listElement.env, null, 2),
                        })
                        setFleetUpdateVisible(true)
                      }}
                      >
                        <FontAwesomeIcon icon={faEdit} fixedWidth />
                        {' '}
                        Edit
                      </Table.ActionsDropdownToggle.Item>
                      <Table.ActionsDropdownToggle.Item onClick={(e) => {
                        e.stopPropagation()
                        setFleetToDeleted(listElement)
                        setFleetDeleteVisible(true)
                      }}
                      >
                        <FontAwesomeIcon icon={faTrash} fixedWidth />
                        {' '}
                        Delete
                      </Table.ActionsDropdownToggle.Item>
                    </Table.ActionsDropdownToggle>
                  )}
                </Table.DataCell>
              </Table.Row>,
            ]

            if (!listElement.deleted) {
              result.push(
                <Table.CollapsibleRow
                  key={`${listElement.name}-collapsible`}
                  colCount={7}
                  expanded={expanded === listElement.name}
                  id={`collapsible-${listElement.name}`}
                >
                  <div className="tw-flex tw-p-6 tw-gap-4 tw-flex-wrap">
                    <div className="tw-grow">
                      <span className="tw-font-bold tw-text-xl">Fleet:</span>
                      <div className="tw-p-4 tw-flex tw-flex-col tw-gap-2">
                        <div>
                          <span className="tw-font-bold">Description:</span>
                          {' '}
                          {listElement.description}
                        </div>
                        <div>
                          <span className="tw-font-bold">Build:</span>
                          {' '}
                          {listElement.build_id /* TODO: replace by build name */}
                        </div>
                        <div>
                          <span className="tw-font-bold">Cluster:</span>
                          {' '}
                          {listElement.cluster}
                        </div>
                        <div>
                          <span className="tw-font-bold">Port:</span>
                          {' '}
                          {listElement.port}
                        </div>
                      </div>
                    </div>
                    <div className="tw-grow">
                      <span className="tw-font-bold tw-text-xl">Game servers:</span>
                      <div className="tw-p-4 tw-flex tw-flex-col tw-gap-2">
                        <div>
                          <span className="tw-font-bold">Minimum to keep ready:</span>
                          {' '}
                          {listElement.min_replicas}
                        </div>
                        <div>
                          <span className="tw-font-bold">Maximum game servers:</span>
                          {' '}
                          {listElement.max_replicas}
                        </div>
                        <div>
                          <span className="tw-font-bold">Ready buffer size:</span>
                          {' '}
                          {listElement.buffer_size}
                        </div>
                      </div>
                    </div>
                    <div className="tw-grow">
                      <ReplicasCountGraph
                        min={listElement.min_replicas}
                        allocated={listElement.in_use}
                        ready={listElement.nb_replicas}
                        max={listElement.max_replicas}
                        buffer={listElement.buffer_size}
                      />
                    </div>
                  </div>
                </Table.CollapsibleRow>,
              )
            }

            return result
          })}
        </Table.Body>
      </Table>
    </div>
  )
}
