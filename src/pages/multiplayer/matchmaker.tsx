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
import React, { useEffect, useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import withSchema from 'src/utils/withSchema'
import SimpleCounter from '@webapps-common/UI/Table/SimpleCounter'
import MainLayout from '@components/MainLayout'
import JSONPanel from '@components/JSON/JSONPanel'
import MatchmakerProfileCreate from '@components/Forms/Matchmaker/MatchmakerProfileCreate'
import MatchmakerProfileUpdate, { MatchmakerProfileUpdated } from '@components/Forms/Matchmaker/MatchmakerProfileUpdate'
import MatchmakerProfileDelete, { MatchmakerProfileDeleted } from '@components/Forms/Matchmaker/MatchmakerProfileDelete'
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

  const fetchListElements = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online').from('matchmaker_profile').select('*').order('name')
    if (res.error) {
      toast.error(`Request failed: ${res.error?.message}`)
      setListElements([])
      return
    }
    setListElements(res.data as MatchmakerProfile[])

    // Pagination
    setTotalCount(res.data.length)
  }, [supabase])

  useEffect(() => {
    fetchListElements()
  }, [fetchListElements])

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
          fetchListElements()
        }}
      />
      <MatchmakerProfileUpdate
        show={profileUpdateVisible}
        updated={profileToUpdate}
        onClose={() => setProfileUpdateVisible(false)}
        onSave={() => {
          setProfileUpdateVisible(false)
          fetchListElements()
        }}
      />
      <MatchmakerProfileDelete
        show={profileDeleteVisible}
        deleted={profileToDelete}
        onCancel={() => setProfileDeleteVisible(false)}
        onSuccess={() => { setProfileDeleteVisible(false); fetchListElements() }}
      />
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
        <SimpleCounter
          total={totalCount}
        />

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

      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell style={{ width: '2%' }}> </Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell className="tw-w-4" />
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
              <div className="tw-p-6 tw-flex tw-gap-4 tw-flex-col">
                <div>
                  <Card>
                    <Card.Header>Query</Card.Header>
                    <Card.Body>
                      {
                      listElement.query
                        ? <JSONPanel value={listElement.query} />
                        : 'This lobby has no properties.'
                      }
                    </Card.Body>
                  </Card>
                </div>
                <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                  <Card>
                    <Card.Header>Players</Card.Header>
                    <Card.Body>
                      <div className="tw-flex tw-flex-col tw-gap-2">
                        <div>
                          <span className="tw-font-bold">Minimum players:</span>
                          {' '}
                          {listElement.min_players}
                        </div>
                        <div>
                          <span className="tw-font-bold">Maximum players:</span>
                          {' '}
                          {listElement.max_players}
                        </div>
                        <div>
                          <span className="tw-font-bold">Progressive:</span>
                          {' '}
                          {listElement.progressive ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Header>Lobby</Card.Header>
                    <Card.Body>
                      <div className="tw-flex tw-flex-col tw-gap-2">
                        <div>
                          <span className="tw-font-bold">Type:</span>
                          {' '}
                          {LobbyTypes[listElement.lobby_type]}
                          <br />
                        </div>
                        <div>
                          <span className="tw-font-bold">Inital state:</span>
                          {' '}
                          {LobbyStates[listElement.lobby_state]}
                          <br />
                        </div>
                        <div>
                          <span className="tw-font-bold">Hidden:</span>
                          {' '}
                          {listElement.lobby_hidden ? 'Yes' : 'No'}
                          <br />
                        </div>
                        <div>
                          <span className="tw-font-bold">Properties:</span>
                          <div className="tw-mt-2">
                            {
                          listElement.lobby_props
                            ? <JSONPanel value={listElement.lobby_props} />
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
    </div>
  )
}
