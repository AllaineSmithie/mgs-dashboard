/*************************************************************************/
/*  clusters.tsx                                                         */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import React, { useEffect, useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import SimpleCounter from '@webapps-common/UI/Table/SimpleCounter'
import withSchema from 'src/utils/withSchema'
import MainLayout from '@components/MainLayout'
import cn from '@webapps-common/utils/classNamesMerge'

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

  const fetchListElements = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online').from('cluster').select('*').order('deleted')
      .order('name')
    if (res.error) {
      toast.error(`Request failed: ${res.error?.message}`)
      setClusterList([])
      return
    }
    setClusterList(res.data as Cluster[])

    // Pagination
    setTotalCount(res.data.length)
  }, [supabase])

  useEffect(() => {
    fetchListElements()
  }, [fetchListElements])

  return (
    <div>
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
        <SimpleCounter
          total={totalCount}
        />
      </div>

      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell>Name</Table.HeaderCell>
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {clusterList.map((cluster) => (
            <Table.Row
              key={cluster.name}
              aria-controls="collapse"
              className={cn({ 'tw-text-scale-500': cluster.deleted })}
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
    </div>
  )
}
