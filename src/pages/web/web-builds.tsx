/*************************************************************************/
/*  web-builds.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import Button from '@webapps-common/UI/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEdit,
  faTrash,
  faPlus,
  faCircleNotch,
  faCircle,
} from '@fortawesome/free-solid-svg-icons'
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import MainLayout from '@components/MainLayout'
import { GraphDefs } from '@components/Graphs'
import withSchema from 'src/utils/withSchema'
import WebBuildCreate from '@components/Forms/WebBuild/WebBuildCreate'
import WebBuildUpdate, {
  WebBuildUpdated,
} from '@components/Forms/WebBuild/WebBuildUpdate'
import WebBuildDelete, { DeletedWebBuild } from '@components/Forms/WebBuild/WebBuildDelete'
import usePaginationState from '@webapps-common/hooks/usePaginationState'
import {
  KeyValueSearchContextProvider,
  KeyValueSearchContextProviderRef,
  OnCompletedCallback,
  OnSearchArgs,
} from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchContextProvider'
import KeyValueSearchBar from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchBar'
import Pagination from '@webapps-common/UI/Pagination'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'
import { PostgrestSingleResponse, RealtimeChannel } from '@supabase/supabase-js'
import useEffectExceptOnMount from '@webapps-common/utils/useEffectExceptOnMount'
import SelectedCounter from '@webapps-common/UI/Table/SelectedCounter'
import cn from '@webapps-common/utils/classNamesMerge'
import Tooltip from '@webapps-common/UI/Tooltip'
import Link from 'next/link'
import { useRuntimeEnvVars } from '@webapps-common/utils/runtimeEnvVarsEndpoint'

export default function WebBuilds() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Web' }],
        breadcrumbCurrentText: 'Builds',
      }}
    >
      <GraphDefs />
      <WebBuildList />
    </MainLayout>
  )
}

export type WebBuild = {
  name: string;
  slug: string;
  object_id: string;
  object_name: string;
  public: boolean;
  state: string;
  message: string;
}
function WebBuildList() {
  const [listElements, setListElements] = useState<WebBuild[]>([])

  // Modals
  const [webBuildCreateVisible, setWebBuildCreateVisible] = useState(false)

  const [webBuildUpdated, setWebBuildUpdated] = useState<WebBuildUpdated | undefined>()
  const [webBuildUpdateVisible, setWebBuildUpdateVisible] = useState(false)

  const [webBuildsToDelete, setWebBuildsToDelete] = useState<DeletedWebBuild[]>([])
  const [webBuildDeleteVisible, setWebBuildDeleteVisible] = useState(false)

  // Realtime updates.
  const realtimeChannelRef = useRef<RealtimeChannel | null>()

  const [selected, setSelected] = useState<string[]>([])

  const supabase = useSupabaseClient()
  const paginationState = usePaginationState()

  const envVars = useRuntimeEnvVars()

  // Ref to the key/value search context.
  const keyValueSearchContextProviderRef = useRef<KeyValueSearchContextProviderRef>(null)

  useEffect(() => {
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe()
    }

    // Listen to changes of statues.
    const channel = supabase.realtime
      .channel('web-build-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'w4online',
          table: 'web_build',
        },
        () => {
          keyValueSearchContextProviderRef?.current?.triggerSearch()
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          toast.error('An error occured while subscribing to real time web builds updates.')
        }
      })
    if (!channel) {
      toast.error('Could not subscribe to web builds updates.')
    }
    realtimeChannelRef.current = channel
  }, [supabase.realtime])

  const onSearch = useCallback(({
    searchTerms,
    keyValues,
  } : OnSearchArgs) => {
    let query = withSchema(supabase, 'w4online')
      .rpc('web_builds_get_all', {}, { count: 'exact' })
      .range(paginationState.firstItemIndex, paginationState.lastItemIndex)

    // Search terms.
    if (searchTerms.length > 0) {
      const searchFilters = searchTerms.map((term) => {
        const fields = ['name', 'slug']
        return fields.map((field) => `${field}.ilike.%${term}%`).join(',')
      }).join('|')
      query = query.or(searchFilters)
    }

    // Filter.
    Object.keys(keyValues).forEach((key) => {
      if (key !== 'sort' && keyValues[key].length > 0) {
        keyValues[key].forEach((f) => {
          query = query.ilike(key, `%${f}%`)
        })
      }
    })

    // Sort.
    if (keyValues.sort?.length === 1) {
      const [filterType, sortType] = keyValues.sort[0].split('-')
      query = query.order(filterType, { ascending: sortType === 'asc' })
    }
    return query
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, paginationState])

  const onCompleted : OnCompletedCallback<PostgrestSingleResponse<unknown>> = ({ result }) => {
    if (result.error) {
      toast.error(`Request failed: ${result.error?.message}`)
      paginationState.setTotalCount(0)
      setListElements([])
      return
    }
    setListElements((result.data || []) as WebBuild[])
    paginationState.setTotalCount(result.count || 0)
  }

  useEffectExceptOnMount(() => {
    keyValueSearchContextProviderRef?.current?.triggerSearch()
    setSelected([])
  }, [paginationState.currentPage])

  const capitalize = (word : string) => (
    word.charAt(0).toUpperCase() + word.slice(1)
  )

  const displayState = (webBuild: WebBuild) => (
    <Tooltip
      content={
        capitalize(webBuild.state.replaceAll('_', ' '))
        + (webBuild.message ? `: ${webBuild.message}` : '')
      }
    >
      <div className="w-8 h-8 flex justify-center items-center">
        <FontAwesomeIcon
          icon={webBuild.state === 'update_in_progress' ? faCircleNotch : faCircle}
          spin={webBuild.state === 'update_in_progress'}
          className={cn({
            'text-red-500': webBuild.state === 'error',
            'text-yellow-500': webBuild.state === 'needs_update' || webBuild.state === 'update_in_progress',
            'text-green-500': webBuild.state === 'ready',
          })}
        />
      </div>
    </Tooltip>
  )

  return (
    <div>
      <WebBuildCreate
        show={webBuildCreateVisible}
        onClose={() => {
          setWebBuildCreateVisible(false)
        }}
        onSave={() => {
          setWebBuildCreateVisible(false)
          keyValueSearchContextProviderRef.current?.triggerSearch()
        }}
      />
      <WebBuildUpdate
        show={webBuildUpdateVisible}
        webBuild={webBuildUpdated}
        onClose={() => {
          setWebBuildUpdateVisible(false)
        }}
        onSave={() => {
          setWebBuildUpdateVisible(false)
          keyValueSearchContextProviderRef.current?.triggerSearch()
        }}
      />
      <WebBuildDelete
        show={webBuildDeleteVisible}
        webBuilds={webBuildsToDelete}
        onDone={() => {
          setSelected([])
          setWebBuildDeleteVisible(false)
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
        <KeyValueSearchBar />
        <div className="flex justify-between items-center my-3 h-9 ps-3">
          { selected.length
            ? (
              <SelectedCounter
                total={selected.length}
                what={['web build', 'web builds']}
                deselect={() => setSelected([])}
                className="min-w-[12rem]"
                contextualActions={(
                  <Button
                    variant="outline-secondary"
                    className="p-2 border"
                    onClick={() => {
                      setWebBuildsToDelete(listElements.filter((e) => (selected.includes(e.slug))))
                      setWebBuildDeleteVisible(true)
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
          <Button
            variant="primary"
            onClick={() => {
              setWebBuildCreateVisible(true)
            }}
          >
            <FontAwesomeIcon icon={faPlus} fixedWidth />
            {' '}
            New Web Build
          </Button>
        </div>

        <Table className="mt-2">
          <Table.Header>
            <Table.HeaderRow>
              <Table.SelectAllHeaderCell
                state={
                  // eslint-disable-next-line no-nested-ternary
                  (selected.length > 0 && selected.length === listElements.length) ? 'checked'
                    : (selected.length === 0 ? 'unchecked' : 'undetermined')
                }
                onPressed={() => {
                  if (selected.length !== listElements.length) {
                    setSelected(listElements.map((e) => (e.slug)))
                  } else {
                    setSelected([])
                  }
                }}
              />
              <Table.SortAndFilterHeaderCell
                keyName="name"
                sortable
              >
                Name
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="url"
                sortable
              >
                URL slug
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="object_name"
                sortable
              >
                File
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="public"
                sortable
              >
                Public
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="state"
                sortable
              >
                State
              </Table.SortAndFilterHeaderCell>
              <Table.HeaderCell className="w-4" />
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {listElements.map((listElement) => {
              const linkRoot = listElement.public
                ? envVars?.env.RUNTIME_PUBLIC_WEB_BUILDS_PUBLIC_URL_ROOT
                : envVars?.env.RUNTIME_PUBLIC_WEB_BUILDS_PRIVATE_URL_ROOT
              return [
                <Table.Row
                  key={listElement.slug}
                >
                  <Table.SelectDataCell
                    checked={selected.includes(listElement.slug)}
                    onPressed={() => {
                      if (selected.includes(listElement.slug)) {
                        setSelected(selected.filter((e) => (e !== listElement.slug)))
                      } else {
                        setSelected([...selected, listElement.slug])
                      }
                    }}
                  />
                  <Table.DataCell>
                    <b>
                      {
                      linkRoot && listElement.state === 'ready' ? (
                        <Link
                          href={new URL(
                            `${listElement.slug}/index.html`,
                            linkRoot,
                          ).href}
                          target="_blank"
                        >
                          {listElement.name}
                        </Link>
                      ) : (
                        listElement.name
                      )
                    }
                    </b>
                  </Table.DataCell>
                  <Table.DataCell>
                    {listElement.slug}
                  </Table.DataCell>
                  <Table.DataCell>
                    {listElement.object_name}
                  </Table.DataCell>
                  <Table.DataCell>
                    {listElement.public ? 'Yes' : 'No'}
                  </Table.DataCell>
                  <Table.DataCell>
                    {displayState(listElement)}
                  </Table.DataCell>
                  <Table.DataCell alignItems="right">
                    <Table.ActionsDropdownToggle>
                      <Table.ActionsDropdownToggle.Item onClick={(e) => {
                        e.stopPropagation()
                        setWebBuildUpdated(listElement)
                        setWebBuildUpdateVisible(true)
                      }}
                      >
                        <FontAwesomeIcon icon={faEdit} fixedWidth />
                        {' '}
                        Edit
                      </Table.ActionsDropdownToggle.Item>
                      <Table.ActionsDropdownToggle.Item onClick={(e) => {
                        e.stopPropagation()
                        setWebBuildsToDelete([listElement])
                        setWebBuildDeleteVisible(true)
                      }}
                      >
                        <FontAwesomeIcon icon={faTrash} fixedWidth />
                        {' '}
                        Delete
                      </Table.ActionsDropdownToggle.Item>
                    </Table.ActionsDropdownToggle>
                  </Table.DataCell>
                </Table.Row>,
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
