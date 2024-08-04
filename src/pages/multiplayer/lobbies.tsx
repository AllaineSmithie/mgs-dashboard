/*************************************************************************/
/*  lobbies.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

/* eslint-disable @typescript-eslint/dot-notation */
import Table from '@webapps-common/UI/Table/Table'
import Badge from '@webapps-common/UI/Badge'
import Alert from '@webapps-common/UI/Alert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronRight,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react'
import Pagination from '@webapps-common/UI/Pagination'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import JSONPanel from '@webapps-common/JSON/JSONPanel'
import withSchema from 'src/utils/withSchema'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'
import MainLayout from '@components/MainLayout'
import LobbiesDelete, { DeletedLobby } from '@components/Forms/Lobby/LobbiesDelete'
import {
  KeyValueSearchContextProvider,
  KeyValueSearchContextProviderRef,
  OnCompletedCallback,
  OnSearchCallback,
} from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchContextProvider'
import KeyValueSearchBar from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchBar'
import usePaginationState from '@webapps-common/hooks/usePaginationState'
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import useEffectExceptOnMount from '@webapps-common/utils/useEffectExceptOnMount'
import IdField from '@webapps-common/UI/IdField'
import Button from '@webapps-common/UI/Button'
import SelectedCounter from '@webapps-common/UI/Table/SelectedCounter'
import JSONManager from '@components/Forms/JSONSchemas'

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

export const LobbyTypes : { [key: number]: string } = {
  0: 'Lobby only',
  1: 'Dedicated game server',
  2: 'WebRTC (full mesh)',
  3: 'WebRTC (player host)',
  4: 'WebRTC (dedicated game server host - EXPERIMENTAL)',
}

export const LobbyStates : { [key: number]: string } = {
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

function LobbyList() {
  const router = useRouter()

  const [lobbyList, setLobbyList] = useState<Lobby[]>([])

  const [lobbiesToDelete, setLobbiesToDelete] = useState<DeletedLobby[]>([])
  const [lobbyDeleteVisible, setLobbiesDeleteVisible] = useState<boolean>(false)

  const [expanded, setExpanded] = useState('')

  const [selected, setSelected] = useState<string[]>([])

  const supabase = useSupabaseClient()

  // Ref to the key/value search context.
  const keyValueSearchContextProviderRef = useRef<KeyValueSearchContextProviderRef>(null)

  // Pagination.
  const paginationState = usePaginationState()

  const onSearch = useCallback<OnSearchCallback<PostgrestSingleResponse<unknown>>>(({
    keyValues,
  }) => {
    let query = withSchema(supabase, 'w4online')
      .rpc('lobby_get_all', {}, { count: 'exact' })
      .range(paginationState.firstItemIndex, paginationState.lastItemIndex)

    // Filter
    if (keyValues['state']) {
      // Turn the state strings ("New", "In Progress", etc) into numbers used in the db (1, 2, etc)
      const stateKeys = Object.keys(LobbyStates)
        .filter((key) => keyValues['state'].includes(LobbyStates[Number(key) as keyof typeof LobbyStates]))
        .map((key) => Number(key))

      if (stateKeys.length > 0) {
        query = query.in('state', stateKeys)
      }
    }
    if (keyValues['type']) {
      const typeKeys = Object.keys(LobbyTypes)
        .filter((key) => keyValues['type'].includes(LobbyTypes[Number(key) as keyof typeof LobbyTypes]))
        .map((key) => Number(key))

      if (typeKeys.length > 0) {
        query = query.in('type', typeKeys)
      }
    }

    // Sort
    if (keyValues.sort?.length === 1) {
      const [key, sortType] = keyValues.sort[0].split('-')
      const isAscending = sortType === 'asc'
      switch (key) {
        case 'id':
          query = query
            .order('id', { ascending: isAscending })
          break
        case 'created_by':
          query = query
            .order('creator_id', { ascending: isAscending })
            .order('matchmaker_profile_id', { ascending: isAscending })
          break
        case 'created':
          query = query.order('created_at', { ascending: isAscending })
          break
        case 'players':
          query = query.order('players', { ascending: isAscending })
          break
        case 'state':
          query = query.order('state', { ascending: isAscending })
          break
        case 'type':
          query = query.order('type', { ascending: isAscending })
          break
        default:
          break
      }
    }
    return query
  }, [supabase, paginationState])

  const onCompleted : OnCompletedCallback<PostgrestSingleResponse<unknown>> = ({ result }) => {
    if (result.error) {
      toast.error(`Request failed: ${result.error?.message}`)
      setLobbyList([])
      return
    }
    setLobbyList(result.data as Lobby[])
    paginationState.setTotalCount(result.count || 0)
  }

  useEffectExceptOnMount(() => {
    keyValueSearchContextProviderRef?.current?.triggerSearch()
    setSelected([])
  }, [paginationState.currentPage])

  useEffect(() => {
    const selectedInQuery = router.query?.selected as string
    if (selectedInQuery) {
      setExpanded(selectedInQuery)
      setSelected([selectedInQuery])
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
      <LobbiesDelete
        show={lobbyDeleteVisible}
        lobbies={lobbiesToDelete}
        onDone={() => {
          setSelected([])
          setLobbiesDeleteVisible(false)
        }}
        onSuccess={() => {
          keyValueSearchContextProviderRef.current?.triggerSearch()
        }}
      />
      {/* eslint-disable-next-line react/jsx-no-bind */}
      <KeyValueSearchContextProvider
        onSearch={onSearch}
        onCompleted={onCompleted}
        onQueryChange={() => { paginationState.setCurrentPage(0) }}
        isResultAbortError={(result) => (result.error && result.error.code === '20') as boolean}
        kvRef={keyValueSearchContextProviderRef}
      >
        <KeyValueSearchBar
          defaultQuery="sort:created-desc"
        />
        <div className="flex justify-between items-center my-3 h-9 ps-3">
          { selected.length
            ? (
              <SelectedCounter
                total={selected.length}
                what={['lobby', 'lobbies']}
                deselect={() => setSelected([])}
                className="min-w-[12rem]"
                contextualActions={(
                  <Button
                    variant="outline-secondary"
                    className="p-2 border"
                    onClick={() => {
                      setLobbiesToDelete(selected.map((id) => ({ id })))
                      setLobbiesDeleteVisible(true)
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} fixedWidth />
                    {' '}
                    Delete selected
                  </Button>
                )}
              />
            ) : (
              <PaginationCounter
                {...paginationState.paginationCounterProps}
              />
            )}
        </div>
        <Table className="mt-2">
          <Table.Header>
            <Table.HeaderRow>
              <Table.SelectAllHeaderCell
                state={
                  // eslint-disable-next-line no-nested-ternary
                  (selected.length > 0 && selected.length === lobbyList.length) ? 'checked'
                    : (selected.length === 0 ? 'unchecked' : 'undetermined')
                }
                onPressed={() => {
                  if (selected.length !== lobbyList.length) {
                    setSelected(lobbyList.map((l) => (l.id)))
                  } else {
                    setSelected([])
                  }
                }}
              />
              <Table.HeaderCell style={{ width: '2%' }}> </Table.HeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="id"
                sortable
              >
                ID
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="created_by"
                sortable
                colSpan={2}
              >
                Created by
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="created"
                sortable
                sortDescByDefault
              >
                Creation date
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="players"
                // "sortable" would be nice to have, but it means sorting according
                // to array lenght, which posgrest does not seem to support.
              >
                Players
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="state"
                sortable
                filterValueList={Object.entries(LobbyStates).map(([, value]) => ({
                  name: value,
                  value,
                }))}
              >
                State
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="type"
                sortable
                filterValueList={Object.entries(LobbyTypes).map(([, value]) => ({
                  name: value,
                  value,
                }))}
              >
                Type
              </Table.SortAndFilterHeaderCell>
              <Table.HeaderCell className="w-4" />
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {lobbyList.map((listElement) => {
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
              if (listElement.type === 1) {
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
              } else if (listElement.type === 4) {
                // Dedicated gameserver (WebRTC)
                if (listElement.gameserver) {
                  gameserverColumn = (
                    <Link
                      href={`/multiplayer/servers/?selected=${listElement.gameserver}`}
                      onClick={(e) => { e.stopPropagation() }}
                    >
                      {`WebRTC with game server (${listElement.gameserver})`}
                    </Link>
                  )
                } else {
                  gameserverColumn = 'WebRTC with game server (not yet allocated)'
                }
              } else if (listElement.type in LobbyTypes) {
                gameserverColumn = LobbyTypes[listElement.type]
              } else {
                gameserverColumn = 'Unknown'
              }
              return [
                <Table.Row
                  key={listElement.id}
                  onClick={() => { setExpanded(expanded === listElement.id ? '' : listElement.id) }}
                  aria-controls="example-collapse-text"
                  aria-expanded={expanded === listElement.id}
                  style={{ cursor: 'pointer' }}
                  selected={selected.includes(listElement.id)}
                >
                  <Table.SelectDataCell
                    checked={selected.includes(listElement.id)}
                    onPressed={() => {
                      if (selected.includes(listElement.id)) {
                        setSelected(selected.filter((e) => (e !== listElement.id)))
                      } else {
                        setSelected([...selected, listElement.id])
                      }
                    }}
                  />
                  <Table.DataCell>
                    {
                    expanded === listElement.id
                      ? <FontAwesomeIcon icon={faChevronDown} fixedWidth />
                      : <FontAwesomeIcon icon={faChevronRight} fixedWidth />
                  }
                  </Table.DataCell>
                  <Table.DataCell>
                    <IdField idValue={listElement.id} />
                  </Table.DataCell>
                  <Table.DataCell>{creator}</Table.DataCell>
                  <Table.DataCell
                    maxWidth={250}
                  >
                    {linkToCreator}
                  </Table.DataCell>
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
                  <Table.DataCell alignItems="right">
                    <Table.ActionButton onClick={(e) => {
                      e.stopPropagation()
                      setLobbiesToDelete([listElement])
                      setLobbiesDeleteVisible(true)
                    }}
                    >
                      <FontAwesomeIcon icon={faTrash} fixedWidth />
                    </Table.ActionButton>
                  </Table.DataCell>
                </Table.Row>,
                <Table.CollapsibleRow
                  key={`${listElement.id}-collapsible`}
                  colCount={8}
                  expanded={expanded === listElement.id}
                  id={`collapsible-${listElement.id}`}
                >
                  <div className="p-6">
                    <span className="font-bold text-xl">Properties:</span>
                    <div className="p-4">
                      <div className="mt-2">
                        <span className="font-bold">Lobby properties:</span>
                        <div className="mt-2">
                          <JSONPanel value={listElement.props} jsonSchemaManager={JSONManager} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-bold">Is hidden:</span>
                        {' '}
                        {listElement.hidden ? 'Yes' : 'No'}
                        {' '}
                      </div>
                      { listElement.cluster
                    && (
                    <div className="mt-2">
                      <span className="font-bold">Gameserver&apos;s cluster:</span>
                      {' '}
                      {listElement.cluster}
                    </div>
                    )}

                    </div>

                    <span className="font-bold text-xl">Players:</span>
                    <div className="p-4">
                      { listElement.players.map((player) => (
                        <div key={player.id}>
                          <Link href={`/users/?selected=${player.id}`}>{player.email}</Link>
                        </div>
                      ))}
                    </div>
                    {!listElement.creator_id && !listElement.matchmaker_profile_id && (
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
      </KeyValueSearchContextProvider>

      <div className="flex justify-end mt-2">
        <Pagination
          {...paginationState.paginationProps}
        />
      </div>
    </div>
  )
}
