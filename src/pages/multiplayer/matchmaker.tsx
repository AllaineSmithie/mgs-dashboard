/*************************************************************************/
/*  matchmaker.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import Button from '@webapps-common/UI/Button'
import Card from '@webapps-common/UI/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faTrash,
  faChevronDown,
  faChevronRight,
  faEdit,
} from '@fortawesome/free-solid-svg-icons'
import React, {
  useEffect, useCallback, useState, useRef,
} from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import withSchema from 'src/utils/withSchema'
import SimpleCounter from '@webapps-common/UI/Table/SimpleCounter'
import MainLayout from '@components/MainLayout'
import JSONPanel from '@webapps-common/JSON/JSONPanel'
import MatchmakerProfileCreate from '@components/Forms/Matchmaker/MatchmakerProfileCreate'
import MatchmakerProfileUpdate, { MatchmakerProfileUpdated } from '@components/Forms/Matchmaker/MatchmakerProfileUpdate'
import MatchmakerProfileDelete, { MatchmakerProfileDeleted } from '@components/Forms/Matchmaker/MatchmakerProfileDelete'

import {
  KeyValueSearchContextProvider,
  KeyValueSearchContextProviderRef,
  OnCompletedCallback,
  OnSearchCallback,
} from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchContextProvider'
import KeyValueSearchBar from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchBar'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

import JSONManager from '@components/Forms/JSONSchemas'
import { LobbyStates, LobbyTypes } from './lobbies'

export default function MatchMaker() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Multiplayer' }],
        breadcrumbCurrentText: 'Matchmaking profiles',
      }}
    >
      <MatchmakingProfilesList />
    </MainLayout>
  )
}

type MatchmakerProfile = {
  id: string;
  name: string;
  query: object;
  min_players: number;
  max_players: number;
  progressive: boolean;
  lobby_type: keyof typeof LobbyTypes;
  lobby_cluster: string;
  lobby_props: object;
  lobby_state: keyof typeof LobbyStates;
  lobby_hidden: boolean;
  lobby_assign_creator: boolean;
}

function MatchmakingProfilesList() {
  const router = useRouter()
  const [listElements, setListElements] = useState<MatchmakerProfile[]>([])

  const [expanded, setExpanded] = useState('')

  const [totalCount, setTotalCount] = useState(0)

  // Modals
  const [profileCreateVisible, setProfileCreateVisible] = useState(false)

  const [profileToUpdate, setProfileToUpdate] = useState<MatchmakerProfileUpdated | undefined>()
  const [profileUpdateVisible, setProfileUpdateVisible] = useState(false)

  const [profileToDelete, setProfileToDelete] = useState<MatchmakerProfileDeleted | undefined>()
  const [profileDeleteVisible, setProfileDeleteVisible] = useState(false)

  const supabase = useSupabaseClient()

  // Ref to the key/value search context.
  const keyValueSearchContextProviderRef = useRef<KeyValueSearchContextProviderRef>(null)

  const onSearch = useCallback<OnSearchCallback<PostgrestSingleResponse<unknown>>>(({
    searchTerms,
    keyValues,
  }) => {
    let query = withSchema(supabase, 'w4online').from('matchmaker_profile').select('*')

    // Search
    if (searchTerms.length > 0) {
      const searchFilter = searchTerms.map((term) => `name.ilike.%${term}%`).join('|')
      query = query.or(searchFilter)
    }
    // Sort
    if (keyValues.sort?.length === 1) {
      const [filterType, sortType] = keyValues.sort[0].split('-')
      if (filterType === 'name') {
        query = query.order('name', { ascending: sortType === 'asc' })
      }
    }
    return query
  }, [supabase])

  const onCompleted : OnCompletedCallback<PostgrestSingleResponse<unknown>> = ({ result }) => {
    if (result.error) {
      toast.error(`Request failed: ${result.error?.message}`)
      setListElements([])
      return
    }
    setListElements(result.data as MatchmakerProfile[])
    setTotalCount(result.count || 0)
  }

  useEffect(() => {
    const selected = router.query?.selected as string
    if (selected) {
      setExpanded(selected)
    }
  }, [router.query])

  return (
    <div className="row align-items-center justify-content-center">
      <MatchmakerProfileCreate
        show={profileCreateVisible}
        onClose={() => setProfileCreateVisible(false)}
        onSave={() => {
          setProfileCreateVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <MatchmakerProfileUpdate
        show={profileUpdateVisible}
        updated={profileToUpdate}
        onClose={() => setProfileUpdateVisible(false)}
        onSave={() => {
          setProfileUpdateVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <MatchmakerProfileDelete
        show={profileDeleteVisible}
        deleted={profileToDelete}
        onCancel={() => setProfileDeleteVisible(false)}
        onSuccess={() => {
          setProfileDeleteVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <div className="flex justify-between items-center mb-3">
        <SimpleCounter total={totalCount} />

        <Button
          variant="primary"
          onClick={() => {
            setProfileCreateVisible(true)
          }}
        >
          <FontAwesomeIcon icon={faPlus} fixedWidth />
          {' '}
          New Matchmaking Profile
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
              <Table.HeaderCell className="w-4" />
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {listElements.map((listElement) => ([
              <Table.Row
                key={listElement.id}
                onClick={() => { setExpanded(expanded === listElement.id ? '' : listElement.id) }}
                aria-controls="collapse"
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
                <Table.DataCell><b>{listElement.name}</b></Table.DataCell>

                <Table.DataCell alignItems="right">
                  <Table.ActionsDropdownToggle>
                    <Table.ActionsDropdownToggle.Item onClick={(e) => {
                      e.stopPropagation()
                      setProfileToUpdate({
                        ...listElement,
                        query: JSON.stringify(listElement.query),
                        lobby_props: JSON.stringify(listElement.lobby_props),
                      })
                      setProfileUpdateVisible(true)
                    }}
                    >
                      <FontAwesomeIcon icon={faEdit} fixedWidth />
                      {' '}
                      Edit
                    </Table.ActionsDropdownToggle.Item>
                    <Table.ActionsDropdownToggle.Item onClick={(e) => {
                      e.stopPropagation()
                      setProfileToDelete(listElement)
                      setProfileDeleteVisible(true)
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
                key={`${listElement.id}-collapse`}
                colCount={6}
                expanded={expanded === listElement.id}
                id={`collapsible-${listElement.id}`}
              >
                <div className="p-6 flex gap-4 flex-col">
                  <div>
                    <Card>
                      <Card.Header>Query</Card.Header>
                      <Card.Body>
                        {
                      listElement.query
                        ? <JSONPanel value={listElement.query} jsonSchemaManager={JSONManager} />
                        : 'This lobby has no properties.'
                      }
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <Card.Header>Players</Card.Header>
                      <Card.Body>
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="font-bold">Minimum players:</span>
                            {' '}
                            {listElement.min_players}
                          </div>
                          <div>
                            <span className="font-bold">Maximum players:</span>
                            {' '}
                            {listElement.max_players}
                          </div>
                          <div>
                            <span className="font-bold">Progressive:</span>
                            {' '}
                            {listElement.progressive ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                    <Card>
                      <Card.Header>Lobby</Card.Header>
                      <Card.Body>
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="font-bold">Type:</span>
                            {' '}
                            {LobbyTypes[listElement.lobby_type]}
                            <br />
                          </div>
                          <div>
                            <span className="font-bold">Inital state:</span>
                            {' '}
                            {LobbyStates[listElement.lobby_state]}
                            <br />
                          </div>
                          <div>
                            <span className="font-bold">Hidden:</span>
                            {' '}
                            {listElement.lobby_hidden ? 'Yes' : 'No'}
                            <br />
                          </div>
                          <div>
                            <span className="font-bold">Properties:</span>
                            <div className="mt-2">
                              {
                          listElement.lobby_props
                            ? (
                              <JSONPanel
                                value={listElement.lobby_props}
                                jsonSchemaManager={JSONManager}
                              />
                            )
                            : 'This lobby has no properties.'
                        }
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Table.CollapsibleRow>,
            ]))}
          </Table.Body>
        </Table>
      </KeyValueSearchContextProvider>
    </div>
  )
}
