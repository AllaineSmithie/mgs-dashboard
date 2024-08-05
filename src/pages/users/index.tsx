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
import UserDelete, { UserDeleted } from '@components/Forms/Users/UserDelete'
import MainLayout from '@components/MainLayout'
import withUserTokenAuthAdmin from 'src/utils/withUserTokenAuthAdmin'
import UserInvite from '@components/Forms/Users/UserInvite'
import Button from '@webapps-common/UI/Button'

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

function UserList({ itemsPerPage = 30 }) {
  const router = useRouter()
  const sessionContext = useSessionContext()
  const [users, setUsers] = useState<(User & { banned_until?: string })[]>([])

  // List counts
  const [pageOffset, setPageOffset] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Modals

  const [userToUnban, setUserToUnban] = useState<UserUnbanned | undefined>()
  const [userUnbanVisible, setUserUnbanVisible] = useState(false)

  const [userToBan, setUserToBan] = useState<UserBanned | undefined>()
  const [userBanVisible, setUserBanVisible] = useState(false)

  const [userCreateVisible, setUserCreateVisible] = useState(false)

  const [userInviteVisible, setUserInviteVisible] = useState(false)

  const [userToUpdate, setUserToUpdate] = useState<UserUpdated | undefined>()
  const [userUpdateVisible, setUserUpdateVisible] = useState(false)

  const [userToDelete, setUserToDelete] = useState<UserDeleted | undefined>()
  const [userDeleteVisible, setUserDeleteVisible] = useState(false)

  // Selected
  const [selected, setSelected] = useState<string>('')

  const supabase = useSupabaseClient()

  const fetchUsers = useCallback(async () => {
    const supabaseAuthAdmin = await withUserTokenAuthAdmin(supabase)
    const res = await supabaseAuthAdmin.listUsers({
      page: pageOffset + 1,
      perPage: itemsPerPage,
    })
    if (res.error) {
      toast.error(`Could not access user list: ${res.error?.message}`)
      setUsers([])
      setPageCount(1)
      setTotalCount(0)
      return
    }
    setUsers(res.data.users)
    setPageCount(res.data.lastPage)
    setTotalCount(res.data.total)
  }, [pageOffset, itemsPerPage, supabase])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const selectedFromQuery = router.query?.selected as string
    if (selectedFromQuery) {
      setSelected(selectedFromQuery)
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
          fetchUsers()
        }}
      />
      <UserBan
        show={userBanVisible}
        banned={userToBan}
        onClose={() => setUserBanVisible(false)}
        onSave={() => {
          setUserBanVisible(false)
          fetchUsers()
        }}
      />
      <UserInvite
        redirectTo={addBasePath('/auth/choose-password')}
        show={userInviteVisible}
        onClose={() => setUserInviteVisible(false)}
        onSave={() => {
          setUserInviteVisible(false)
          fetchUsers()
        }}
      />
      <UserCreate
        show={userCreateVisible}
        onClose={() => setUserCreateVisible(false)}
        onSave={() => {
          setUserCreateVisible(false)
          fetchUsers()
        }}
      />
      <UserUpdate
        show={userUpdateVisible}
        updated={userToUpdate}
        onClose={() => setUserUpdateVisible(false)}
        onSave={() => {
          setUserUpdateVisible(false)
          fetchUsers()
        }}
      />
      <UserDelete
        show={userDeleteVisible}
        deleted={userToDelete}
        onCancel={() => setUserDeleteVisible(false)}
        onSuccess={() => {
          setUserDeleteVisible(false)
          fetchUsers()
        }}
      />
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
        <div>
          Showing
          {' '}
          <span className="tw-font-semibold">{pageOffset * itemsPerPage}</span>
          {' '}
          to
          {' '}
          <span className="tw-font-semibold">{pageOffset + users.length}</span>
          {' '}
          of
          {' '}
          <span className="tw-font-semibold">{totalCount}</span>
          {' '}
          results
        </div>

        <div className="tw-flex tw-gap-2">
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
      <Table>
        <Table.Header>
          <Table.HeaderRow>
            {['Email', 'Role', 'Last sign-in', 'Created'].map((label) => (
              <Table.HeaderCell key={label}>
                {label}
              </Table.HeaderCell>
            ))}
            <Table.HeaderCell className="tw-w-4" />
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {users.map((user) => {
            const canBan = user.id !== sessionContext.session?.user.id
            return (
              <Table.Row
                key={user.id}
                selected={selected === user.id}
              >
                <Table.DataCell className="tw-font-medium tw-text-foreground">
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
                        setUserToDelete(user)
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
