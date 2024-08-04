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
import React, {
  useEffect, useCallback, useState, useRef,
} from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { ReplicasCountGraph, GraphDefs } from '@components/Graphs'
import withSchema from 'src/utils/withSchema'
import MainLayout from '@components/MainLayout'

import { Cluster } from 'src/pages/multiplayer/clusters'

import FleetCreate from '@components/Forms/Fleet/FleetCreate'
import FleetUpdate, { FleetUpdated } from '@components/Forms/Fleet/FleetUpdate'
import FleetDelete, { FleetDeleted } from '@components/Forms/Fleet/FleetDelete'
import cn from '@webapps-common/utils/classNamesMerge'
import {
  KeyValueSearchContextProvider,
  KeyValueSearchContextProviderRef,
  OnCompletedCallback,
  OnSearchArgs,
  useKeyValueSearchContext,
} from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchContextProvider'
import KeyValueSearchBar from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchBar'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

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
  autoscale: boolean;
  max_replicas: number;
  buffer_size: number;
  autoscaling_interval: number;
  deleted: boolean;
}

function FleetList() {
  const router = useRouter()
  const [fleetList, setFleetList] = useState<Fleet[]>([])
  const [clusterList, setClusterList] = useState<Cluster[]>([])

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

  // Ref to the key/value search context.
  const keyValueSearchContextProviderRef = useRef<KeyValueSearchContextProviderRef>(null)

  const onSearch = useCallback(({
    searchTerms,
    keyValues,
  } : OnSearchArgs) => {
    let query = withSchema(supabase, 'w4online').rpc('fleet_get_all').order('deleted')

    // Search.
    searchTerms.forEach((term) => {
      query = query.ilike('name', `%${term}%`)
    })

    // Filter.
    if (keyValues.cluster) {
      query = query.in('cluster', keyValues.cluster)
    }
    if (keyValues.label) {
      keyValues.label.forEach((label) => {
        const [key, value] = label.split(':')
        query = query.filter(`labels->>${key}`, 'eq', value)
      })
    }

    // Sort.
    if (keyValues.sort?.length === 1) {
      const [filterType, sortType] = keyValues.sort[0].split('-')
      query = query.order(filterType, { ascending: sortType === 'asc' })
    }

    return query
  }, [supabase])

  const onCompleted : OnCompletedCallback<PostgrestSingleResponse<unknown>> = ({ result }) => {
    if (result.error) {
      toast.error(`Request failed: ${result.error?.message}`)
      setFleetList([])
      return
    }

    setFleetList(result.data as Fleet[])
    setTotalCount(result.count || 0)
  }

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

  // Get the list of clusters
  const fetchClusterList = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online')
      .from('cluster')
      .select('*')
      .eq('deleted', false)
      .order('name')
    if (res.error) {
      toast.error(`Could not retrieve the cluster list: ${res.error?.message}`)
      return
    }
    setClusterList(res.data as Cluster[])
  }, [supabase])

  useEffect(() => {
    fetchClusterList()
  }, [fetchClusterList])

  return (
    <div>
      <FleetCreate
        show={fleetCreateVisible}
        onClose={() => setFleetCreateVisible(false)}
        onSave={() => {
          setFleetCreateVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
        fleetLabelsKeys={fleetLabelsKeys}
      />
      <FleetUpdate
        show={fleetUpdateVisible}
        updated={fleetToUpdate}
        onClose={() => setFleetUpdateVisible(false)}
        onSave={() => {
          setFleetUpdateVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
        fleetLabelsKeys={fleetLabelsKeys}
      />
      <FleetDelete
        show={fleetDeleteVisible}
        deleted={fleetToDelete}
        onCancel={() => setFleetDeleteVisible(false)}
        onSuccess={() => {
          setFleetDeleteVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />

      <div className="flex justify-between items-center mb-3">
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
      {/* eslint-disable-next-line react/jsx-no-bind */}
      <KeyValueSearchContextProvider
        onSearch={onSearch}
        onCompleted={onCompleted}
        isResultAbortError={(result) => (result.error && result.error.code === '20') as boolean}
        kvRef={keyValueSearchContextProviderRef}
      >
        <KeyValueSearchBar
          defaultQuery="sort:name-asc"
        />
        <Table className="mt-2">
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeaderCell style={{ width: '2%' }}> </Table.HeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="name"
                sortable
              >
                Name
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="cluster"
                filterValueList={clusterList.map((cluster) => (
                  { name: cluster.name, value: cluster.name }
                ))}
                sortable
              >
                Cluster
              </Table.SortAndFilterHeaderCell>
              <Table.HeaderCell>Labels</Table.HeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="in_use"
                sortable
              >
                Occupancy rate
              </Table.SortAndFilterHeaderCell>
              <Table.HeaderCell className="w-4" />
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {fleetList.map((listElement) => {
              const realMaxReplicas = listElement.autoscale
                ? listElement.max_replicas : listElement.min_replicas
              const result = [
                <Table.Row
                  key={listElement.name}
                  aria-controls="example-collapse-text"
                  aria-expanded={expanded === listElement.name}
                  style={!listElement.deleted ? { cursor: 'pointer' } : {}}
                  className={cn('h-12', { 'text-scale-500': listElement.deleted })}
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
                    {Object.keys(listElement.labels).map((labelKey) => (
                      <LabelBadge
                        key={labelKey}
                        labelKey={labelKey}
                        fleet={listElement}
                      />
                    ))}
                  </Table.DataCell>
                  <Table.DataCell className="w-56">
                    {listElement.in_use}
                    {' '}
                    /
                    {realMaxReplicas}
                    {' '}
                    - (
                    {realMaxReplicas === 0 ? 0 : Math.trunc(
                      (listElement.in_use / realMaxReplicas) * 100,
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
                    <div className="flex p-6 gap-4 flex-wrap">
                      <div className="grow">
                        <span className="font-bold text-xl">Fleet:</span>
                        <div className="p-4 flex flex-col gap-2">
                          <div>
                            <span className="font-bold">Description:</span>
                            {' '}
                            {listElement.description}
                          </div>
                          <div>
                            <span className="font-bold">Build:</span>
                            {' '}
                            {listElement.build_id /* TODO: replace by build name */}
                          </div>
                          <div>
                            <span className="font-bold">Cluster:</span>
                            {' '}
                            {listElement.cluster}
                          </div>
                          <div>
                            <span className="font-bold">Port:</span>
                            {' '}
                            {listElement.port}
                          </div>
                        </div>
                      </div>
                      <div className="grow">
                        <span className="font-bold text-xl">Game servers:</span>
                        <div className="p-4 flex flex-col gap-2">
                          <div>
                            <span className="font-bold">Autoscale:</span>
                            {' '}
                            {listElement.autoscale ? 'Yes' : 'No'}
                          </div>
                          {listElement.autoscale ? (
                            <>
                              <div>
                                <span className="font-bold">Minimum to keep ready:</span>
                                {' '}
                                {listElement.min_replicas}
                              </div>
                              <div>
                                <span className="font-bold">Maximum game servers:</span>
                                {' '}
                                {listElement.max_replicas}
                              </div>
                              <div>
                                <span className="font-bold">Ready buffer size:</span>
                                {' '}
                                {listElement.buffer_size}
                              </div>
                            </>
                          ) : (
                            <div>
                              <span className="font-bold">Game server count:</span>
                              {' '}
                              {listElement.min_replicas}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grow">
                        <ReplicasCountGraph
                          autoscale={listElement.autoscale}
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
      </KeyValueSearchContextProvider>
    </div>
  )
}

function LabelBadge({ fleet, labelKey }: { fleet: Fleet; labelKey: string }) {
  const { setKeyValue: setFilter } = useKeyValueSearchContext()
  const labelString = `${labelKey}:${fleet.labels[labelKey]}`
  function filterByLabel() {
    setFilter(
      {
        key: 'label',
        value: `"${labelString}"`,
        replace: true,
      },
    )
  }
  return (
    <div
      key={`${labelKey}-${fleet.labels[labelKey]}`}
      className="mr-1 inline"
      onClick={(e) => {
        e.stopPropagation()
        filterByLabel()
      }}
    // For accessibility
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && filterByLabel()}
    >
      <Badge
        bg="primary"
      >
        {labelString}
      </Badge>
    </div>
  )
}
