/*************************************************************************/
/*  lobbies.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import Badge from '@webapps-common/UI/Badge'
import Alert from '@webapps-common/UI/Alert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useState } from 'react'
import Pagination from '@webapps-common/UI/Pagination'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import JSONPanel from '@components/JSON/JSONPanel'
import withSchema from 'src/utils/withSchema'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'
import MainLayout from '@components/MainLayout'

export default function Lobbies() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Multiplayer' }],
        breadcrumbCurrentText: 'Lobbies',
      }}
    >
      <LobbyList />
    </MainLayout>
  )
}

export const LobbyTypes = {
  0: 'Lobby only',
  1: 'Dedicated game server',
  2: 'WebRTC',
}

export const LobbyStates = {
  1: 'New',
  2: 'In progress',
  3: 'Sealed',
  4: 'Done',
}

type Lobby = {
  id: string;
  type: number;
  props: object;
  state: number;
  hidden: boolean;
  cluster: string | null;
  players: {
    id: string;
    email: string;
  }[];
  created_at: number;
  creator_id: string;
  gameserver: string;
  max_players: number;
  creator_email: string;
  matchmaker_profile_id: string;
  matchmaker_profile_name: string;
}

function LobbyList({ itemsPerPage = 30 }) {
  const router = useRouter()
  const [listElements, setListElements] = useState<Lobby[]>([])

  const [expanded, setExpanded] = useState('')

  const [pageOffset, setPageOffset] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const supabase = useSupabaseClient()

  useEffect(() => {
    const fetchListElements = async () => {
      const res = await withSchema(supabase, 'w4online').rpc('lobby_get_all')
      if (res.error) {
        toast.error(`Request failed: ${res.error?.message}`)
        setListElements([])
        return
      }
      setListElements(res.data ? res.data : [])

      // Pagination
      setPageCount(1)
      setTotalCount(res.data ? res.data.length : 0)
    }
    fetchListElements()
  }, [supabase])

  useEffect(() => {
    const selected = router.query?.selected as string
    if (selected) {
      setExpanded(selected)
    }
  }, [router.query])

  const stateIntToBadge = (state : number) => {
    const statusIntToBadgeMap = {
      1: (
        <>
          <style type="text/css">
            {`
        .bg-primary {
          background-color: #4F98CA !important;
          vertical-align: middle;
        }
        `}
          </style>
          <Badge>{LobbyStates[1]}</Badge>
        </>
      ),
      2: <Badge bg="success">{LobbyStates[2]}</Badge>,
      3: <Badge bg="success">{LobbyStates[3]}</Badge>,
      4: <Badge bg="secondary">{LobbyStates[4]}</Badge>,
    }
    return state in statusIntToBadgeMap
      ? statusIntToBadgeMap[state as keyof typeof statusIntToBadgeMap]
      : null
  }

  const dateFormat = (dateTimestamp : number) => {
    const date = DateTime.fromSeconds(dateTimestamp)
    return `${date.toFormat('kkkk-MM-dd')} at ${date.toFormat('HH:mm')}`
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
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell colSpan={2}>Created by</Table.HeaderCell>
            <Table.HeaderCell>Creation date</Table.HeaderCell>
            <Table.HeaderCell>Players</Table.HeaderCell>
            <Table.HeaderCell>State</Table.HeaderCell>
            <Table.HeaderCell>P2P / Game server</Table.HeaderCell>
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {listElements.map((listElement) => {
            let linkToCreator = null
            if (listElement.creator_id) {
              linkToCreator = <Link href={`/users/?selected=${listElement.creator_id}`} onClick={(e) => { e.stopPropagation() }}>{listElement.creator_email}</Link>
            } else {
              linkToCreator = (listElement.matchmaker_profile_id
                ? <Link href={`/multiplayer/matchmaker/?selected=${listElement.matchmaker_profile_id}`} onClick={(e) => { e.stopPropagation() }}>{listElement.matchmaker_profile_name ? listElement.matchmaker_profile_name : listElement.matchmaker_profile_id}</Link>
                : '')
            }

            let creator = 'Player'
            if (!listElement.creator_id) {
              creator = listElement.matchmaker_profile_id ? 'Matchmaker' : 'System'
            }

            let gameserverColumn = null
            if (listElement.type === 0) {
              // Lobby only
              gameserverColumn = 'Lobby only'
            } else if (listElement.type === 1) {
              // Dedicated gameserver
              if (listElement.gameserver) {
                gameserverColumn = (
                  <Link
                    href={`/multiplayer/servers/?selected=${listElement.gameserver}`}
                    onClick={(e) => { e.stopPropagation() }}
                  >
                    {`Game server (${listElement.gameserver})`}
                  </Link>
                )
              } else {
                gameserverColumn = 'Game server (not yet allocated)'
              }
            } else if (listElement.type === 2) {
              // P2P
              gameserverColumn = 'P2P'
            }
            return [
              <Table.Row
                key={listElement.id}
                onClick={() => { setExpanded(expanded === listElement.id ? '' : listElement.id) }}
                aria-controls="example-collapse-text"
                aria-expanded={expanded === listElement.id}
                style={{ cursor: 'pointer' }}
              >
                <Table.DataCell>
                  {
                    expanded === listElement.id
                      ? <FontAwesomeIcon icon={faChevronDown} fixedWidth />
                      : <FontAwesomeIcon icon={faChevronRight} fixedWidth />
                  }
                </Table.DataCell>
                <Table.DataCell><b>{listElement.id}</b></Table.DataCell>
                <Table.DataCell>{creator}</Table.DataCell>
                <Table.DataCell>{linkToCreator}</Table.DataCell>
                <Table.DataCell>{dateFormat(listElement.created_at)}</Table.DataCell>
                <Table.DataCell>
                  {listElement.players.length}
                  {' '}
                  /
                  {' '}
                  {listElement.max_players}
                </Table.DataCell>
                <Table.DataCell>{stateIntToBadge(listElement.state)}</Table.DataCell>
                <Table.DataCell>
                  {gameserverColumn}
                </Table.DataCell>
              </Table.Row>,
              <Table.CollapsibleRow
                key={`${listElement.id}-collapsible`}
                colCount={8}
                expanded={expanded === listElement.id}
                id={`collapsible-${listElement.id}`}
              >
                <div className="tw-p-6">
                  <span className="tw-font-bold tw-text-xl">Properties:</span>
                  <div className="tw-p-4">
                    <div className="tw-mt-2">
                      <span className="tw-font-bold">Lobby properties:</span>
                      <div className="tw-mt-2">
                        <JSONPanel value={listElement.props} />
                      </div>
                    </div>
                    <div className="tw-mt-2">
                      <span className="tw-font-bold">Is hidden:</span>
                      {' '}
                      {listElement.hidden ? 'Yes' : 'No'}
                      {' '}
                    </div>
                    { listElement.cluster
                    && (
                    <div className="tw-mt-2">
                      <span className="tw-font-bold">Gameserver&apos;s cluster:</span>
                      {' '}
                      {listElement.cluster}
                    </div>
                    )}

                  </div>

                  <span className="tw-font-bold tw-text-xl">Players:</span>
                  <div className="tw-p-4">
                    { listElement.players.map((player) => (
                      <div key={player.id}>
                        <Link href={`/users/?selected=${player.id}`}>{player.email}</Link>
                      </div>
                    ))}
                  </div>
                  {true && (
                  <Alert variant="secondary">
                    <u>Note:</u>
                    {' '}
                    This lobby was created by the system.
                    It may have been created by the matchmaker,
                    but the profile used to create this lobby has been deleted.
                  </Alert>
                  )}
                </div>
              </Table.CollapsibleRow>,
            ]
          })}
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
