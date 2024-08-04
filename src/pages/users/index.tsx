/*************************************************************************/
/*  index.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEdit,
  faGavel,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import React, {
  useEffect, useState, useCallback,
  useRef,
} from 'react'
import Table from '@webapps-common/UI/Table/Table'
import Pagination from '@webapps-common/UI/Pagination'
import { toast } from 'react-toastify'
import {
  useSessionContext,
  useSupabaseClient,
} from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import humanizeDuration from 'humanize-duration'
import { User } from '@supabase/gotrue-js'
import { addBasePath } from 'next/dist/client/add-base-path'
import UserBan, { UserBanned } from '@components/Forms/Users/UserBan'
import UserUnban, { UserUnbanned } from '@components/Forms/Users/UserUnban'
import UserCreate from '@components/Forms/Users/UserCreate'
import UserUpdate, { UserUpdated } from '@components/Forms/Users/UserUpdate'
import UserDelete, { DeletedUser } from '@components/Forms/Users/UserDelete'
import MainLayout from '@components/MainLayout'
import UserInvite from '@components/Forms/Users/UserInvite'
import Button from '@webapps-common/UI/Button'
import usePaginationState from '@webapps-common/hooks/usePaginationState'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'
import withSchema from '@services/withSchema'
import {
  KeyValueSearchContextProvider,
  KeyValueSearchContextProviderRef,
  OnCompletedCallback,
  OnSearchArgs,
} from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchContextProvider'
import KeyValueSearchBar from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchBar'
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import useEffectExceptOnMount from '@webapps-common/utils/useEffectExceptOnMount'
import SelectedCounter from '@webapps-common/UI/Table/SelectedCounter'

export default function Users() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'Users',
      }}
    >
      <UserList />
    </MainLayout>
  )
}

function UserList() {
  const router = useRouter()
  const sessionContext = useSessionContext()
  const [users, setUsers] = useState<(User & { banned_until?: string })[]>([])

  // Modals
  const [userToUnban, setUserToUnban] = useState<UserUnbanned | undefined>()
  const [userUnbanVisible, setUserUnbanVisible] = useState(false)

  const [userToBan, setUserToBan] = useState<UserBanned | undefined>()
  const [userBanVisible, setUserBanVisible] = useState(false)

  const [userCreateVisible, setUserCreateVisible] = useState(false)

  const [userInviteVisible, setUserInviteVisible] = useState(false)

  const [userToUpdate, setUserToUpdate] = useState<UserUpdated | undefined>()
  const [userUpdateVisible, setUserUpdateVisible] = useState(false)

  const [usersToDelete, setUserToDelete] = useState<DeletedUser[]>([])
  const [userDeleteVisible, setUserDeleteVisible] = useState(false)

  // Selected
  const [selected, setSelected] = useState<string[]>([])

  const supabase = useSupabaseClient()

  // Ref to the key/value search context.
  const keyValueSearchContextProviderRef = useRef<KeyValueSearchContextProviderRef>(null)

  const paginationState = usePaginationState()

  const onSearch = useCallback(({
    searchTerms,
    keyValues,
  } : OnSearchArgs) => {
    let query = withSchema(supabase, 'w4online')
      .rpc('users_get_all', {}, { count: 'exact' })
      .range(paginationState.firstItemIndex, paginationState.lastItemIndex)
    // Search
    if (searchTerms.length > 0) {
      const searchFilters = searchTerms.map((term) => {
        const fields = ['email']
        return fields.map((field) => `${field}.ilike.%${term}%`).join(',')
      }).join('|')
      query = query.or(searchFilters)
    }
    // Filter
    Object.keys(keyValues).forEach((filterKey) => {
      if (filterKey !== 'sort' && keyValues[filterKey].length > 0) {
        keyValues[filterKey].forEach((f) => {
          query = query.ilike(filterKey, `%${f}%`)
        })
      }
    })
    // Sort
    if (keyValues.sort?.length === 1) {
      const [filterType, sortType] = keyValues.sort[0].split('-')
      query = query.order(filterType, { ascending: sortType === 'asc' })
    }
    return query
  }, [supabase, paginationState])

  const onCompleted : OnCompletedCallback<PostgrestSingleResponse<unknown>> = ({ result }) => {
    if (result.error) {
      toast.error(`Could not access user list: ${result.error?.message}`)
      setUsers([])
      paginationState.setTotalCount(0)
      return
    }
    paginationState.setTotalCount(result.count || 0)
    setUsers(result.data as User[])
  }

  useEffectExceptOnMount(() => {
    keyValueSearchContextProviderRef?.current?.triggerSearch()
    setSelected([])
  }, [paginationState.currentPage])

  useEffect(() => {
    const selectedFromQuery = router.query?.selected as string
    if (selectedFromQuery) {
      setSelected([selectedFromQuery])
    }
  }, [router.query])

  const dateFormat = (dateTimestamp: string) => {
    const date = DateTime.fromISO(dateTimestamp)
    const diff = DateTime.now().diff(date)
    return `${date.toFormat('kkkk-MM-dd')} at ${date.toFormat('HH:mm')} (${
      humanizeDuration(diff.toMillis(), {
        largest: 1,
        round: true,
        units: ['y', 'd', 'h', 'm', 's'],
      })} ago )`
  }

  const isBanned = (bannedUntil: string) => {
    if (!bannedUntil) {
      return false
    }
    const bannedUntildate = DateTime.fromISO(bannedUntil)
    // TODO: ideally, check against the server time instead, but requires changes to gotrue-js
    return bannedUntildate > DateTime.now()
  }

  return (
    <div>
      <UserUnban
        show={userUnbanVisible}
        unbanned={userToUnban}
        onClose={() => setUserUnbanVisible(false)}
        onSave={() => {
          setUserUnbanVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <UserBan
        show={userBanVisible}
        banned={userToBan}
        onClose={() => setUserBanVisible(false)}
        onSave={() => {
          setUserBanVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <UserInvite
        redirectTo={addBasePath('/auth/choose-password')}
        show={userInviteVisible}
        onClose={() => setUserInviteVisible(false)}
        onSave={() => {
          setUserInviteVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <UserCreate
        show={userCreateVisible}
        onClose={() => setUserCreateVisible(false)}
        onSave={() => {
          setUserCreateVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <UserUpdate
        show={userUpdateVisible}
        updated={userToUpdate}
        onClose={() => setUserUpdateVisible(false)}
        onSave={() => {
          setUserUpdateVisible(false)
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <UserDelete
        show={userDeleteVisible}
        users={usersToDelete}
        onDone={() => {
          setSelected([])
          setUserDeleteVisible(false)
        }}
        onSuccess={() => {
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        }}
      />
      <KeyValueSearchContextProvider
        onSearch={onSearch}
        onCompleted={onCompleted}
        onQueryChange={() => { paginationState.setCurrentPage(0) }}
        isResultAbortError={(result) => (result.error && result.error.code === '20') as boolean}
        kvRef={keyValueSearchContextProviderRef}
      >
        <KeyValueSearchBar />
        <div className="flex justify-between items-center my-3 h-9 ps-3">
          { selected.length
            ? (
              <SelectedCounter
                total={selected.length}
                what={['user', 'users']}
                deselect={() => setSelected([])}
                className="min-w-[12rem]"
                contextualActions={(
                  <Button
                    variant="outline-secondary"
                    className="p-2 border"
                    onClick={() => {
                      setUserToDelete(selected.map((id) => ({ id })))
                      setUserDeleteVisible(true)
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
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setUserCreateVisible(true)
              }}
              variant="secondary"
            >
              <FontAwesomeIcon icon={faPlus} fixedWidth />
              {' '}
              New user
            </Button>
            <Button
              onClick={() => {
                setUserInviteVisible(true)
              }}
            >
              <FontAwesomeIcon icon={faPlus} fixedWidth />
              {' '}
              Invite user
            </Button>
          </div>
        </div>
        <Table className="mt-2">
          <Table.Header>
            <Table.HeaderRow>
              <Table.SelectAllHeaderCell
                state={
                  // eslint-disable-next-line no-nested-ternary
                  (selected.length > 0 && selected.length === users.length) ? 'checked'
                    : (selected.length === 0 ? 'unchecked' : 'undetermined')
                }
                onPressed={() => {
                  if (selected.length !== users.length) {
                    setSelected(users.map((u) => (u.id)))
                  } else {
                    setSelected([])
                  }
                }}
              />
              <Table.SortAndFilterHeaderCell
                keyName="email"
                sortable
              >
                Email
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="role"
                sortable
                filterValueList={
                  [
                    {
                      name: 'Admin',
                      value: 'service_role',
                    },
                    {
                      name: 'User',
                      value: 'authenticated',
                    },
                  ]
                }
              >
                Role
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="last_sign_in_at"
                sortable
              >
                Last sign-in
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="created_at"
                sortable
                sortDescByDefault
              >
                Created
              </Table.SortAndFilterHeaderCell>
              <Table.HeaderCell className="w-4" />
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {users.map((user) => {
              const canBan = user.id !== sessionContext.session?.user.id
              return (
                <Table.Row
                  key={user.id}
                  selected={selected.includes(user.id)}
                >
                  <Table.SelectDataCell
                    checked={selected.includes(user.id)}
                    onPressed={() => {
                      if (selected.includes(user.id)) {
                        setSelected(selected.filter((e) => (e !== user.id)))
                      } else {
                        setSelected([...selected, user.id])
                      }
                    }}
                  />
                  <Table.DataCell
                    className="font-medium text-foreground"
                    maxWidth={250}
                    copyValue={user.email}
                  >
                    {user.email}
                  </Table.DataCell>
                  <Table.DataCell>
                    {user.role === 'service_role' ? 'Admin' : 'User'}
                  </Table.DataCell>
                  <Table.DataCell>
                    {user.last_sign_in_at
                      ? dateFormat(user.last_sign_in_at)
                      : 'Never'}
                  </Table.DataCell>
                  <Table.DataCell>
                    {dateFormat(user.created_at)}
                  </Table.DataCell>
                  <Table.DataCell alignItems="right">
                    <Table.ActionsDropdownToggle>
                      {user.banned_until && isBanned(user.banned_until) ? (
                        <Table.ActionsDropdownToggle.Item
                          onClick={() => {
                            setUserToUnban(user)
                            setUserUnbanVisible(true)
                          }}
                        >
                          <FontAwesomeIcon icon={faGavel} fixedWidth />
                          {' '}
                          Unban
                        </Table.ActionsDropdownToggle.Item>
                      ) : (
                        <Table.ActionsDropdownToggle.Item
                          disabled={!canBan}
                          onClick={() => {
                            setUserToBan(user)
                            setUserBanVisible(true)
                          }}
                        >
                          <FontAwesomeIcon icon={faGavel} fixedWidth />
                          {' '}
                          Ban
                        </Table.ActionsDropdownToggle.Item>
                      )}
                      <Table.ActionsDropdownToggle.Item
                        onClick={() => {
                          setUserToUpdate(user)
                          setUserUpdateVisible(true)
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} fixedWidth />
                        {' '}
                        Edit
                      </Table.ActionsDropdownToggle.Item>
                      <Table.ActionsDropdownToggle.Item
                        onClick={() => {
                          setUserToDelete([user])
                          setUserDeleteVisible(true)
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} fixedWidth />
                        {' '}
                        Delete
                      </Table.ActionsDropdownToggle.Item>
                    </Table.ActionsDropdownToggle>
                  </Table.DataCell>
                </Table.Row>
              )
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
