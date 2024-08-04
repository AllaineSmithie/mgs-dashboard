/*************************************************************************/
/*  clusters.tsx                                                         */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import React, { useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import SimpleCounter from '@webapps-common/UI/Table/SimpleCounter'
import withSchema from 'src/utils/withSchema'
import MainLayout from '@components/MainLayout'
import cn from '@webapps-common/utils/classNamesMerge'
import {
  KeyValueSearchContextProvider,
  OnCompletedCallback,
  OnSearchArgs,
} from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchContextProvider'
import KeyValueSearchBar from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchBar'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

export default function Clusters() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Multiplayer' }],
        breadcrumbCurrentText: 'Clusters',
      }}
    >
      <ClusterList />
    </MainLayout>
  )
}

export type Cluster = {
  name: string;
  deleted: boolean;
}

function ClusterList() {
  const [clusterList, setClusterList] = useState<Cluster[]>([])

  const [totalCount, setTotalCount] = useState(0)

  const supabase = useSupabaseClient()

  const onSearch = useCallback(({
    searchTerms,
    keyValues,
  }: OnSearchArgs) => {
    let query = withSchema(supabase, 'w4online').from('cluster').select('*')
    // Search
    if (searchTerms.length > 0) {
      searchTerms.forEach((term) => {
        query = query.ilike('name', `%${term}%`)
      })
    }
    // Sort
    if (keyValues.sort?.length === 1) {
      const [key, sortType] = keyValues.sort[0].split('-')
      query = query.order(key, { ascending: sortType === 'asc' })
    } else {
      // Default sorting if no sort filter is provided
      query = query.order('deleted').order('name')
    }
    return query
  }, [supabase])

  const onCompleted : OnCompletedCallback<PostgrestSingleResponse<unknown>> = ({ result }) => {
    if (result.error) {
      toast.error(`Request failed: ${result.error?.message}`)
      setClusterList([])
      return
    }
    const resClusterList = result.data as Cluster[]
    setClusterList(resClusterList)
    // Pagination
    setTotalCount(resClusterList.length)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <SimpleCounter
          total={totalCount}
        />
      </div>
      {/* eslint-disable-next-line react/jsx-no-bind */}
      <KeyValueSearchContextProvider
        onSearch={onSearch}
        onCompleted={onCompleted}
        isResultAbortError={(result) => (result.error && result.error.code === '20') as boolean}
      >
        <KeyValueSearchBar />
        <Table className="mt-2">
          <Table.Header>
            <Table.HeaderRow>
              <Table.SortAndFilterHeaderCell
                keyName="name"
                sortable
              >
                Name
              </Table.SortAndFilterHeaderCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {clusterList.map((cluster) => (
              <Table.Row
                key={cluster.name}
                aria-controls="collapse"
                className={cn({ 'text-scale-500': cluster.deleted })}
              >
                {!cluster.deleted
                  ? <Table.DataCell>{cluster.name}</Table.DataCell>
                  : (
                    <Table.DataCell>
                      {cluster.name}
                      {' '}
                      (deleted)
                    </Table.DataCell>
                  )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </KeyValueSearchContextProvider>
    </div>
  )
}
