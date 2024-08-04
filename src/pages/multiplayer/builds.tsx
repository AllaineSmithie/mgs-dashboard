/*************************************************************************/
/*  builds.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import Button from '@webapps-common/UI/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronRight,
  faEdit,
  faTrash,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import React, {
  useCallback, useRef, useState,
} from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import prettyBytes from 'pretty-bytes'
import MainLayout from '@components/MainLayout'
import { GraphDefs } from '@components/Graphs'
import withSchema from 'src/utils/withSchema'
import JSONPanel from '@webapps-common/JSON/JSONPanel'
import BuildCreate from '@components/Forms/Builds/BuildCreate'
import BuildUpdate, {
  BuildUpdated,
} from '@components/Forms/Builds/BuildUpdate'
import BuildDelete, { DeletedBuild } from '@components/Forms/Builds/BuildDelete'
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
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import useEffectExceptOnMount from '@webapps-common/utils/useEffectExceptOnMount'
import SelectedCounter from '@webapps-common/UI/Table/SelectedCounter'
import JSONManager from '@components/Forms/JSONSchemas'

export default function Builds() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Multiplayer' }],
        breadcrumbCurrentText: 'Builds',
      }}
    >
      <GraphDefs />
      <BuildList />
    </MainLayout>
  )
}

export type Build = {
  id: string;
  name: string;
  object_name: string;
  object_metadata: {
    eTag?: string;
    size?: number;
    mimetype?: string;
    cacheControl?: string;
    lastModifed?: string;
    contentLength?: number;
    httpStatusCode?: number;
  };
  props: object;
}
function BuildList() {
  const [listElements, setListElements] = useState<Build[]>([])

  const [expanded, setExpanded] = useState<string>('')

  // Modals
  const [buildCreateVisible, setBuildCreateVisible] = useState(false)

  const [buildUpdated, setBuildUpdated] = useState<BuildUpdated | undefined>()
  const [buildUpdateVisible, setBuildUpdateVisible] = useState(false)

  const [buildsToDelete, setBuildsToDelete] = useState<DeletedBuild[]>([])
  const [buildDeleteVisible, setBuildDeleteVisible] = useState(false)

  const [selected, setSelected] = useState<string[]>([])

  const supabase = useSupabaseClient()
  const paginationState = usePaginationState()

  // Ref to the key/value search context.
  const keyValueSearchContextProviderRef = useRef<KeyValueSearchContextProviderRef>(null)

  const onSearch = useCallback(({
    searchTerms,
    keyValues,
  } : OnSearchArgs) => {
    let query = withSchema(supabase, 'w4online')
      .rpc('gameserver_build_get_all', {}, { count: 'exact' })
      .range(paginationState.firstItemIndex, paginationState.lastItemIndex)

    // Search terms.
    if (searchTerms.length > 0) {
      const searchFilters = searchTerms.map((term) => {
        const fields = ['name', 'object_name']
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
  }, [supabase, paginationState])

  const onCompleted : OnCompletedCallback<PostgrestSingleResponse<unknown>> = ({ result }) => {
    if (result.error) {
      toast.error(`Request failed: ${result.error?.message}`)
      paginationState.setTotalCount(0)
      setListElements([])
      return
    }
    setListElements(result.data as Build[])
    paginationState.setTotalCount(result.count || 0)
  }

  useEffectExceptOnMount(() => {
    keyValueSearchContextProviderRef?.current?.triggerSearch()
    setSelected([])
  }, [paginationState.currentPage])

  return (
    <div>
      <BuildCreate
        show={buildCreateVisible}
        onClose={() => {
          setBuildCreateVisible(false)
        }}
        onSave={() => {
          setBuildCreateVisible(false)
          keyValueSearchContextProviderRef.current?.triggerSearch()
        }}
      />
      <BuildUpdate
        show={buildUpdateVisible}
        updated={buildUpdated}
        onClose={() => {
          setBuildUpdateVisible(false)
        }}
        onSave={() => {
          setBuildUpdateVisible(false)
          keyValueSearchContextProviderRef.current?.triggerSearch()
        }}
      />
      <BuildDelete
        show={buildDeleteVisible}
        builds={buildsToDelete}
        onDone={() => {
          setSelected([])
          setBuildDeleteVisible(false)
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
                what={['build', 'builds']}
                deselect={() => setSelected([])}
                className="min-w-[12rem]"
                contextualActions={(
                  <Button
                    variant="outline-secondary"
                    className="p-2 border"
                    onClick={() => {
                      setBuildsToDelete(listElements.filter((e) => (selected.includes(e.id))))
                      setBuildDeleteVisible(true)
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
              setBuildCreateVisible(true)
            }}
          >
            <FontAwesomeIcon icon={faPlus} fixedWidth />
            {' '}
            New Build
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
                    setSelected(listElements.map((e) => (e.id)))
                  } else {
                    setSelected([])
                  }
                }}
              />
              <Table.HeaderCell style={{ width: '2%' }}> </Table.HeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="name"
                sortable
              >
                Name
              </Table.SortAndFilterHeaderCell>
              <Table.SortAndFilterHeaderCell
                keyName="object_name"
                sortable
              >
                File
              </Table.SortAndFilterHeaderCell>
              <Table.HeaderCell className="w-4" />
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {listElements.map((listElement) => [
              <Table.Row
                key={listElement.id}
                onClick={() => {
                  setExpanded(expanded === listElement.id ? '' : listElement.id)
                }}
                aria-controls="collapse"
                aria-expanded={expanded === listElement.id}
                style={{ cursor: 'pointer' }}
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
                  {expanded === listElement.id ? (
                    <FontAwesomeIcon icon={faChevronDown} fixedWidth />
                  ) : (
                    <FontAwesomeIcon icon={faChevronRight} fixedWidth />
                  )}
                </Table.DataCell>
                <Table.DataCell>
                  <b>{listElement.name}</b>
                </Table.DataCell>
                <Table.DataCell>
                  {listElement.object_name}
                  {' '}
                  {listElement.object_metadata.size
                  && `(${prettyBytes(listElement.object_metadata.size)})`}
                </Table.DataCell>
                <Table.DataCell alignItems="right">
                  <Table.ActionsDropdownToggle>
                    <Table.ActionsDropdownToggle.Item onClick={(e) => {
                      e.stopPropagation()
                      setBuildUpdated({
                        ...listElement,
                        props: JSON.stringify(listElement.props, null, 2),
                      })

                      setBuildUpdateVisible(true)
                    }}
                    >
                      <FontAwesomeIcon icon={faEdit} fixedWidth />
                      {' '}
                      Edit
                    </Table.ActionsDropdownToggle.Item>
                    <Table.ActionsDropdownToggle.Item onClick={(e) => {
                      e.stopPropagation()
                      setBuildsToDelete([listElement])
                      setBuildDeleteVisible(true)
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
                key={`${listElement.id}-collapsible`}
                colCount={7}
                expanded={expanded === listElement.id}
                id={`collapsible-${listElement.id}`}
              >
                <div className="p-6">
                  <span className="font-bold">Properties:</span>
                  <div className="mt-2">
                    {listElement.props ? (
                      <JSONPanel value={listElement.props} jsonSchemaManager={JSONManager} />
                    ) : (
                      'This lobby has no properties.'
                    )}
                  </div>
                </div>
              </Table.CollapsibleRow>,
            ])}
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
