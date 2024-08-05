/*************************************************************************/
/*  index.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import SimpleCounter from '@webapps-common/UI/Table/SimpleCounter'
import { toast } from 'react-toastify'
import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import withSchema from 'src/utils/withSchema'
import MainLayout from '@components/MainLayout'

export default function Tables() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Data' }],
        breadcrumbCurrentText: 'Database',
      }}
    >
      <TableList schemaref="public" />
    </MainLayout>
  )
}

// A signle column's properties
type ColumnsDefinition = {
  type: string;
  format: string;
}

// List of columns
type TableDefinition = {
  [key: string]: ColumnsDefinition;
}

// List of tables
type SchemaDefinition = {
  [key: string]: {
    properties: TableDefinition;
  };
}

// Table entry
type TableEntry = {
  id: string;
  tableDef: TableDefinition;
  rowCount: number;
}

type TableListProps = {
  schemaref: string;
}
function TableList({ schemaref }: TableListProps) {
  const supabase = useSupabaseClient()

  const [tableList, setTableList] = useState<TableEntry[]>([])

  const [expanded, setExpanded] = useState('')

  const [totalCount, setTotalCount] = useState(0)

  const fetchListElements = useCallback(async () => {
    // Query the table metadata (column names and types)
    const res = await withSchema(supabase, schemaref).from('').select()
    if (res.error) {
      toast.error(`Could not access table list: ${res.error?.message}`)
      setTableList([])
      setTotalCount(0)
      return
    }
    const api = res.data as {
      definitions?: SchemaDefinition;
    }
    if (!api || res.error || !api.definitions) {
      return
    }
    const schema = api.definitions

    const countRequests: PromiseLike<TableEntry>[] = []

    Object.keys(schema)
      .forEach((tableName) => {
        const promise = withSchema(supabase, 'public')
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .then((result) => {
            const out : TableEntry = {
              id: tableName,
              tableDef: schema[tableName].properties,
              rowCount: result.count || 0,
            }
            return out
          })
        countRequests.push(promise)
      })
    const list = await Promise.all(countRequests)
    setTableList(list)
    setTotalCount(list.length)
  }, [supabase, schemaref])

  useEffect(() => {
    fetchListElements()
  }, [fetchListElements])

  return (
    <div>
      <div className="tw-mb-3">
        <SimpleCounter total={totalCount} />
      </div>

      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell>Table</Table.HeaderCell>
            <Table.HeaderCell>Rows count</Table.HeaderCell>
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {tableList.map((table) => (
            <Table.Row
              key={table.id}
              onClick={() => {
                setExpanded(expanded === table.id ? '' : table.id)
              }}
              aria-controls="example-collapse-text"
              aria-expanded={expanded === table.id}
              style={{ cursor: 'pointer' }}
            >
              <Table.DataCell>
                <Link href={`/data/database/${schemaref}/${table.id}`}>
                  {table.id}
                </Link>
              </Table.DataCell>
              <Table.DataCell>{table.rowCount}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}
