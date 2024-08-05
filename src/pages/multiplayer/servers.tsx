/*************************************************************************/
/*  servers.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'
import Spinner from '@webapps-common/UI/Spinner'
import Badge from '@webapps-common/UI/Badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Pagination from '@webapps-common/UI/Pagination'
import Link from 'next/link'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import withSchema from 'src/utils/withSchema'

import MainLayout from '@components/MainLayout'

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

function GameServerList({ itemsPerPage = 30 }) {
  const router = useRouter()
  const [listElements, setListElements] = useState<GameServer[]>([])

  const [expanded, setExpanded] = useState('')

  const [pageOffset, setPageOffset] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const supabase = useSupabaseClient()

  useEffect(() => {
    const fetchListElements = async () => {
      const res = await withSchema(supabase, 'w4online').rpc('gameserver_get_all')
      if (res.error) {
        toast.error(`Request failed: ${res.error?.message}`)
        setListElements([])
        return
      }
      setListElements(res.data)

      // Pagination
      setPageCount(1)
      setTotalCount(res.data.length)
    }

    fetchListElements()
  }, [supabase])

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
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
        <PaginationCounter
          from={pageOffset * itemsPerPage}
          to={pageOffset + listElements.length}
          total={totalCount}
        />
      </div>
      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell style={{ width: '2%' }}> </Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Fleet</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Address</Table.HeaderCell>
            <Table.HeaderCell>Port</Table.HeaderCell>
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {listElements.map((listElement) => ([
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
              <div className="tw-p-6">
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
