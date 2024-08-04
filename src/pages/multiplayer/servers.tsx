/*************************************************************************/
/*  servers.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

/* eslint-disable @typescript-eslint/dot-notation */
import Table from '@webapps-common/UI/Table/Table'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'
import Spinner from '@webapps-common/UI/Spinner'
import Badge from '@webapps-common/UI/Badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react'
import { toast } from 'react-toastify'
import Pagination from '@webapps-common/UI/Pagination'
import Link from 'next/link'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import withSchema from 'src/utils/withSchema'

import MainLayout from '@components/MainLayout'

import KeyValueSearchBar from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchBar'
import usePaginationState from '@webapps-common/hooks/usePaginationState'
import {
  KeyValueSearchContextProvider,
  KeyValueSearchContextProviderRef,
  OnCompletedCallback,
  OnSearchCallback,
} from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchContextProvider'
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import useEffectExceptOnMount from '@webapps-common/utils/useEffectExceptOnMount'

export default function GameServers() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Multiplayer' }],
        breadcrumbCurrentText: 'Game servers',
      }}
    >
      <GameServerList />
    </MainLayout>
  )
}

type GameServer = {
  name: string;
  address: string;
  port: number;
  node: string;
  created_at: number;
  fleet: string;
  state: string;
  lobby_id: string;
}

function GameServerList() {
  const router = useRouter()
  const [gameServerList, setGameServerList] = useState<GameServer[]>([])

  const [expanded, setExpanded] = useState('')

  const supabase = useSupabaseClient()

  const paginationState = usePaginationState()

  // Ref to the key/value search context.
  const keyValueSearchContextProviderRef = useRef<KeyValueSearchContextProviderRef>(null)

  const onSearch = useCallback<OnSearchCallback<PostgrestSingleResponse<unknown>>>(({
    searchTerms,
    keyValues,
  }) => {
    let query = withSchema(supabase, 'w4online')
      .rpc('gameserver_get_all', {}, { count: 'exact' })
      .range(paginationState.firstItemIndex, paginationState.lastItemIndex)
    // Search
    if (searchTerms.length > 0) {
      const searchFilters = searchTerms.map((term) => {
        const fields = ['name', 'fleet', 'state', 'address']
        return fields.map((field) => `${field}.ilike.%${term}%`).join(',')
      }).join('|')
      query = query.or(searchFilters)
    }
    // Filter
    Object.keys(keyValues).forEach((key) => {
      if (key !== 'sort' && keyValues[key].length > 0) {
        keyValues[key].forEach((f) => {
          query = query.ilike(key, `%${f}%`)
        })
      }
    })
    // Sort
    if (keyValues.sort?.length === 1) {
      const [key, sortType] = keyValues.sort[0].split('-')
      query = query.order(key, { ascending: sortType === 'asc' })
    }
    return query
  }, [supabase, paginationState])

  const onCompleted : OnCompletedCallback<PostgrestSingleResponse<unknown>> = ({ result }) => {
    if (result.error) {
      toast.error(`Request failed: ${result.error?.message}`)
      setGameServerList([])
      paginationState.setTotalCount(0)
      return
    }
    setGameServerList(result.data as GameServer[])
    paginationState.setTotalCount(result.count || 0)
  }

  useEffectExceptOnMount(() => {
    keyValueSearchContextProviderRef?.current?.triggerSearch()
  }, [paginationState.currentPage])

  useEffect(() => {
    const selected = router.query?.selected as string
    if (selected) {
      setExpanded(selected)
    }
  }, [router.query])

  const statusBadge = (status : string) => {
    if (status === 'Allocated') {
      return <Badge bg="success">Allocated</Badge>
    } if (status === 'Ready') {
      return (
        <>
          <style type="text/css">
            {`
            .bg-primary {
              background-color: #4F98CA !important;
              vertical-align: middle;
            }
            `}
          </style>
          <Badge>Ready</Badge>
        </>
      )
    } if (status === 'Starting') {
      <style type="text/css">
        {`
          .bg-primary {
            background-color: #4F98CA !important;
            vertical-align: middle;
          }
          `}
      </style>
      return (
        <Badge>
          <Spinner />
          {' '}
          {status}
        </Badge>
      )
    }
    return <Badge bg="secondary">{status}</Badge>
  }

  return (
    <div>
      {/* eslint-disable-next-line react/jsx-no-bind */}
      <KeyValueSearchContextProvider
        onSearch={onSearch}
        onCompleted={onCompleted}
        onQueryChange={() => { paginationState.setCurrentPage(0) }}
        isResultAbortError={(result) => (result.error && result.error.code === '20') as boolean}
        kvRef={keyValueSearchContextProviderRef}
      >
        <KeyValueSearchBar />
        <div className="flex justify-between items-center my-3">
          <PaginationCounter
            {...paginationState.paginationCounterProps}
          />
        </div>
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
                keyName="fleet"
                sortable
              >
                Fleet
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="state"
                sortable
                filterValueList={[
                  {
                    name: 'Allocated',
                    value: 'allocated',
                  },
                  {
                    name: 'Ready',
                    value: 'ready',
                  },
                  {
                    name: 'Starting',
                    value: 'starting',
                  },
                  {
                    name: 'Scheduled',
                    value: 'scheduled',
                  },
                ]}
              >
                Status
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="address"
                sortable
              >
                Address
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="port"
                sortable
              >
                Port
              </Table.SortAndFilterHeaderCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {gameServerList.map((listElement) => ([
              <Table.Row
                key={listElement.name}
                onClick={() => { setExpanded(expanded === listElement.name ? '' : listElement.name) }}
                aria-controls="collapse"
                aria-expanded={expanded === listElement.name}
                style={{ cursor: 'pointer' }}
              >
                <Table.DataCell>
                  {
                  expanded === listElement.name
                    ? <FontAwesomeIcon icon={faChevronDown} fixedWidth />
                    : <FontAwesomeIcon icon={faChevronRight} fixedWidth />
                }
                </Table.DataCell>
                <Table.DataCell><b>{listElement.name}</b></Table.DataCell>
                <Table.DataCell><Link href={`/multiplayer/fleets/?selected=${listElement.fleet}`} onClick={(e) => { e.stopPropagation() }}>{listElement.fleet}</Link></Table.DataCell>
                <Table.DataCell>{statusBadge(listElement.state)}</Table.DataCell>
                <Table.DataCell>{listElement.address ? listElement.address : 'Unknown'}</Table.DataCell>
                <Table.DataCell>{listElement.port ? listElement.port : 'Unknown'}</Table.DataCell>
              </Table.Row>,
              <Table.CollapsibleRow
                key={`${listElement.name}-collapse`}
                colCount={6}
                expanded={expanded === listElement.name}
                id={`collapsible-${listElement.name}`}
              >
                <div className="p-6">
                  <p>
                    <b>Creation date:</b>
                    {' '}
                    {listElement.created_at}
                  </p>
                  { listElement.lobby_id && (
                  <p>
                    <b>Current lobby:</b>
                    {' '}
                    <Link href={`/multiplayer/lobbies/?selected=${listElement.lobby_id}`}>{listElement.lobby_id}</Link>
                  </p>
                  )}
                </div>
              </Table.CollapsibleRow>,
            ]))}
          </Table.Body>
        </Table>
      </KeyValueSearchContextProvider>

      <div className="flex justify-end mt-2">
        <Pagination
          {...paginationState.paginationProps}
        />
      </div>
    </div>
  )
}
