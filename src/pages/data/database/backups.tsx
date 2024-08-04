/*************************************************************************/
/*  backups.tsx                                                          */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import { toast } from 'react-toastify'
import React, {
  useState, useCallback, useRef, useEffect,
} from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import withSchema from 'src/utils/withSchema'
import MainLayout from '@components/MainLayout'
import Badge from '@webapps-common/UI/Badge'
import {
  faChevronDown, faChevronRight, faExternalLink, faPlus, faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  KeyValueSearchContextProvider,
  KeyValueSearchContextProviderRef,
  OnCompletedCallback,
  OnSearchArgs,
} from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchContextProvider'
import KeyValueSearchBar from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchBar'
import cn from '@webapps-common/utils/classNamesMerge'
import { PostgrestSingleResponse, RealtimeChannel } from '@supabase/supabase-js'
import Button from '@webapps-common/UI/Button'
import BackupCreate from '@components/Forms/Backup/BackupCreate'
import TableActionButton from '@webapps-common/UI/Table/TableActionButton'
import BackupDelete, { BackupDeleted } from '@components/Forms/Backup/BackupDelete'
import usePaginationState from '@webapps-common/hooks/usePaginationState'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'
import Pagination from '@webapps-common/UI/Pagination'
import useEffectExceptOnMount from '@webapps-common/utils/useEffectExceptOnMount'
import { DateTime } from 'luxon'
import humanizeDuration from 'humanize-duration'
import IdField from '@webapps-common/UI/IdField'

export default function Backups() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Data' }],
        breadcrumbCurrentText: 'Backups',
      }}
    >
      <BackupList />
    </MainLayout>
  )
}

type Replica = {
  url: string;
  name: string;
  error: string | null;
}

type Backup = {
  id: string;
  started_at: string;
  finished_at: string;
  error_message: string;
  state: BackupState;
  created_at: string;
  replicas: Replica[];
}

const backupStates = ['pending', 'started', 'finished', 'cancelled', 'error', 'deleting']
type BackupState = typeof backupStates[number]

function BackupList() {
  const supabase = useSupabaseClient()

  // Table content.
  const [backupList, setBackupList] = useState<Backup[]>([])

  // Realtime updates.
  const realtimeChannelRef = useRef<RealtimeChannel | null>()

  // Modals.
  const [backupCreateVisible, setBackupCreateVisible] = useState<boolean>(false)

  const [backupDeleteVisible, setBackupDeleteVisible] = useState<boolean>(false)
  const [backupToDelete, setBackupToDelete] = useState<BackupDeleted | undefined>()

  // Expanded table element.
  const [expanded, setExpanded] = useState('')

  // Ref to the key/value search context.
  const keyValueSearchContextProviderRef = useRef<KeyValueSearchContextProviderRef>(null)

  // Pagination.
  const paginationState = usePaginationState()

  const onSearch = useCallback(({
    searchTerms,
    keyValues,
  } : OnSearchArgs) => {
    // Query the table metadata (column names and types)
    let query = withSchema(supabase, 'w4backup').from('backup').select('*', { count: 'exact' })
      .range(paginationState.firstItemIndex, paginationState.lastItemIndex)

    // Search
    if (searchTerms.length > 0) {
      const searchFilters = searchTerms.map((term) => {
        const fields = ['state']
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
      const arr = keyValues.sort[0].split('-')
      let sortKey = arr[0]
      if (sortKey === 'date') {
        sortKey = 'finished_at'
      }
      const sortOrder = arr[1]
      query = query.order(sortKey, { ascending: sortOrder === 'asc' })
    }
    return query
  }, [supabase, paginationState])

  const onCompleted : OnCompletedCallback<PostgrestSingleResponse<unknown>> = ({ result }) => {
    if (result.error) {
      toast.error(`Could not access backup list: ${result.error?.message}`)
      setBackupList([])
      paginationState.setTotalCount(0)
      return
    }
    setBackupList(result.data as Backup[])
    paginationState.setTotalCount(result.count || 0)
  }

  useEffectExceptOnMount(() => {
    keyValueSearchContextProviderRef?.current?.triggerSearch()
  }, [paginationState.currentPage])

  useEffect(() => {
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe()
    }
    // Listen to changes of statues.
    const channel = supabase.realtime
      .channel('backup-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'w4backup',
          table: 'backup',
        },
        () => {
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          toast.error('An error occured while subscribing to real time backup updates.')
        }
      })
    if (!channel) {
      toast.error('Could not subscribe to backup updates.')
    }
    realtimeChannelRef.current = channel
  }, [supabase.realtime])

  const capitalize = (word : string) => (
    word.charAt(0).toUpperCase() + word.slice(1)
  )

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

  function stateToBadge(state: string) {
    let bg : 'primary' | 'secondary' | 'success' | 'danger' | 'warning' = 'secondary'
    if (state === 'error') {
      bg = 'danger'
    } else if (state === 'finished') {
      bg = 'success'
    }
    return (
      <Badge
        bg={bg}
      >
        {capitalize(state)}
      </Badge>
    )
  }

  return (
    <div>
      <BackupCreate
        show={backupCreateVisible}
        onCancel={() => setBackupCreateVisible(false)}
        onSuccess={() => {
          setBackupCreateVisible(false)
        }}
      />
      <BackupDelete
        show={backupDeleteVisible}
        onCancel={() => setBackupDeleteVisible(false)}
        onSuccess={() => {
          setBackupDeleteVisible(false)
        }}
        deleted={backupToDelete}
      />
      <div className="flex justify-between items-center mb-3">
        <PaginationCounter
          {...paginationState.paginationCounterProps}
        />
        <Button
          variant="primary"
          onClick={() => {
            setBackupCreateVisible(true)
          }}
        >
          <FontAwesomeIcon icon={faPlus} fixedWidth />
          {' '}
          Backup Now
        </Button>
      </div>

      <KeyValueSearchContextProvider
        onSearch={onSearch}
        onCompleted={onCompleted}
        onQueryChange={() => {
          paginationState.setCurrentPage(0)
        }}
        isResultAbortError={(result) => (result.error && result.error.code === '20') as boolean}
        kvRef={keyValueSearchContextProviderRef}
      >
        <KeyValueSearchBar
          defaultQuery="sort:date-desc"
        />
        <Table className="mt-2">
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeaderCell style={{ width: '2%' }}> </Table.HeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="state"
                sortable
                filterValueList={
                  backupStates.map((id) => ({ name: capitalize(id), value: id }))
                }
              >
                Status
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="id"
                sortable
              >
                Backup
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="date"
                sortable
                sortDescByDefault
              >
                Date
              </Table.SortAndFilterHeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {backupList.map((backup) => {
              const output = [
                <Table.Row
                  key={backup.id}
                  onClick={() => {
                    setExpanded(expanded === backup.id ? '' : backup.id)
                  }}
                  aria-controls="example-collapse-text"
                  aria-expanded={expanded === backup.id}
                  className={cn({ 'cursor-pointer': backup.replicas })}
                >
                  <Table.DataCell onClick={() => {
                    setExpanded(
                      expanded === backup.id ? '' : backup.id,
                    )
                  }}
                  >
                    {backup.replicas && (
                      expanded === backup.id ? (
                        <FontAwesomeIcon icon={faChevronDown} fixedWidth />
                      ) : (
                        <FontAwesomeIcon icon={faChevronRight} fixedWidth />
                      )
                    )}
                  </Table.DataCell>
                  <Table.DataCell>
                    <div className="flex items-center">
                      {stateToBadge(backup.state)}
                    </div>
                  </Table.DataCell>
                  <Table.DataCell>
                    <IdField idValue={backup.id} />
                  </Table.DataCell>
                  <Table.DataCell>
                    {dateFormat(backup.finished_at)}
                  </Table.DataCell>
                  <Table.DataCell>
                    <TableActionButton
                      onClick={(e) => {
                        e.stopPropagation()
                        setBackupToDelete(backup)
                        setBackupDeleteVisible(true)
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} fixedWidth />
                    </TableActionButton>
                  </Table.DataCell>
                </Table.Row>,
              ]
              if (backup.replicas) {
                output.push(
                  <Table.CollapsibleRow
                    key={`${backup.id}-collapsible`}
                    colCount={7}
                    expanded={expanded === backup.id}
                    id={`collapsible-${backup.id}`}
                  >
                    <div className="flex flex-col gap-2 ps-14 pe-5 py-4">
                      {backup.replicas.map((replica) => (
                        <div
                          key={replica.url}
                          className="grid grid-cols-4"
                        >
                          <div className="flex items-center">
                            {replica.name}
                          </div>
                          <div className="col-span-3">
                            {// eslint-disable-next-line no-nested-ternary
                              replica.error ? (
                                <span className="text-danger-500">
                                  {replica.error}
                                </span>
                              ) : (
                                replica.url
                                  ? (
                                    <Button
                                      onClick={(e) => {
                                        e.preventDefault()

                                        // Create a link and click it
                                        const link = document.createElement('a')
                                        link.href = replica.url
                                        link.setAttribute('target', '_black')
                                        document.body.appendChild(link)
                                        link.click()
                                        link.parentNode?.removeChild(link)
                                      }}
                                      className="w-20"
                                    >
                                      <FontAwesomeIcon icon={faExternalLink} />
                                    </Button>
                                  ) : (
                                    <div
                                      className="w-20 flex justify-center"
                                    >
                                      <span className="dark:text-brand-200 text-brand-800">
                                        Success
                                      </span>
                                    </div>
                                  )
                              )
}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Table.CollapsibleRow>,
                )
              }
              return output
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
