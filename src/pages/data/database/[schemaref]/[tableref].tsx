/*************************************************************************/
/*  [tableref].tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'
import Alert from '@webapps-common/UI/Alert'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import withSchema from 'src/utils/withSchema'
import MainLayout from '@components/MainLayout'
import RowDelete, { RowDeleted } from '@components/Forms/Database/RowDelete'

export default function TableData() {
  const router = useRouter()
  const { tableref, schemaref } = router.query
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [
          { text: 'Data' },
          { text: 'Database', href: '/data/database' },
          { text: schemaref as string },
        ],
        breadcrumbCurrentText: tableref as string,
      }}
    >
      <TableDataList tableref={tableref as string} schemaref={schemaref as string} />
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

// A Row
type Row = {
  [key: string]: unknown;
}

type TableDataListProps = {
  tableref: string;
  schemaref: string;
  itemsPerPage?: number;
}
function TableDataList({
  tableref,
  schemaref,
  itemsPerPage = 30,
}: TableDataListProps) {
  const [rows, setRows] = useState<Row[]>([])
  const [columnsDefinitions, setColumndDefinitions] = useState<TableDefinition>({})

  // Modals
  const [rowToDelete, setRowToDelete] = useState<RowDeleted | undefined>()
  const [rowDeleteVisible, setRowDeleteVisible] = useState(false)

  const [totalCount, setTotalCount] = useState<number>(0)

  const charLimit = 30

  const supabase = useSupabaseClient()

  const fetchListElements = useCallback(async () => {
    if (!tableref || !schemaref) {
      return
    }

    {
      // Query the table metadata (column names and types)
      const res = await withSchema(supabase, schemaref).from('').select()
      const api = res.data as {
        definitions?: SchemaDefinition;
      }
      if (!api || res.error || !api.definitions || !api.definitions[tableref]) {
        return
      }
      setColumndDefinitions(api.definitions[tableref].properties)
    }

    {
      // Query the table data (values)
      const res = await withSchema(supabase, schemaref)
        .from(tableref)
        .select('*', { count: 'exact' })
        .limit(itemsPerPage) // TODO handle pagination.
      setRows(res.data as Row[])
      setTotalCount(res.count || 0)
    }
  }, [supabase, itemsPerPage, schemaref, tableref])

  useEffect(() => {
    fetchListElements()
  }, [fetchListElements])

  return (
    <div>
      <RowDelete
        show={rowDeleteVisible}
        deleted={rowToDelete}
        onCancel={() => setRowDeleteVisible(false)}
        onSuccess={() => {
          setRowDeleteVisible(false)
          fetchListElements()
        }}
      />

      <div className="tw-mb-3">
        <PaginationCounter
          from={0}
          to={rows.length}
          total={totalCount}
        />
      </div>

      <Table>
        <Table.Header>
          <Table.HeaderRow>
            {Object.entries(columnsDefinitions).map(([name, props]) => {
              let type = props?.type ? String(props.type) : null
              if (type === null) {
                type = props.format
              }
              return (
                <Table.HeaderCell key={name + props.type}>
                  {}
                  {name}
                  {' '}
                  <span
                    style={{
                      color: 'grey',
                      fontWeight: 'lighter',
                      fontSize: '0.8em',
                    }}
                  >
                    {type}
                  </span>
                </Table.HeaderCell>
              )
            })}

            <Table.HeaderCell className="tw-w-4" />
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {rows.map((listElement, idx) => (
            <Table.Row
              key={idx} // eslint-disable-line react/no-array-index-key
              aria-controls="example-collapse-text"
              style={{ cursor: 'pointer' }}
            >
              {Object.keys(columnsDefinitions).map((columnName: string) => {
                let valueText = null
                if (typeof listElement[columnName] === 'object') {
                  if (listElement[columnName] === null) {
                    valueText = 'null'
                  } else {
                    valueText = JSON.stringify(listElement[columnName])
                  }
                } else {
                  valueText = String(listElement[columnName])
                }
                if (valueText.length > charLimit) {
                  valueText = `${valueText.slice(0, charLimit)}...`
                }
                return <Table.DataCell key={columnName}>{valueText}</Table.DataCell>
              })}
              <Table.DataCell alignItems="right">
                <Table.ActionButton
                  onClick={(e) => {
                    e.stopPropagation()
                    setRowToDelete({
                      schema: schemaref,
                      table: tableref,
                      row: listElement,
                    })
                    setRowDeleteVisible(true)
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} fixedWidth />
                </Table.ActionButton>
              </Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {totalCount - rows.length > 0 && (
        <Alert
          variant="secondary"
          className="tw-flex tw-justify-center tw-items-center"
        >
          {totalCount - rows.length}
          {' '}
          hidden rows
        </Alert>
      )}
    </div>
  )
}
