/*************************************************************************/
/*  [tableref].tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import withSchema from 'src/utils/withSchema'
import MainLayout from '@components/MainLayout'
import RowDelete, { DeletedRows } from '@components/Forms/Database/RowDelete'
import usePaginationState from '@webapps-common/hooks/usePaginationState'
import Pagination from '@webapps-common/UI/Pagination'
import { toast } from 'react-toastify'
import SelectedCounter from '@webapps-common/UI/Table/SelectedCounter'
import Button from '@webapps-common/UI/Button'

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
}
function TableDataList({
  tableref,
  schemaref,
}: TableDataListProps) {
  const [rows, setRows] = useState<Row[]>([])
  const [columnsDefinitions, setColumndDefinitions] = useState<TableDefinition>({})

  // Modals
  const [rowsToDelete, setRowsToDelete] = useState<DeletedRows>({ schema: '', table: '', rows: [] })
  const [rowDeleteVisible, setRowDeleteVisible] = useState(false)

  const [selected, setSelected] = useState<number[]>([])

  const maxWidth = 250

  const supabase = useSupabaseClient()

  const paginationState = usePaginationState()

  const fetchListElements = useCallback(async () => {
    if (!tableref || !schemaref) {
      return
    }

    {
      // Query the table metadata (column names and types)
      const res = await withSchema(supabase, schemaref).from('').select('*', { count: 'exact' })
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
        .range(paginationState.firstItemIndex, paginationState.lastItemIndex)
      if (res.error) {
        toast.error(`Could not retrieve row list: ${res.error.message}`)
        setRows([])
        paginationState.setTotalCount(0)
        return
      }
      setRows(res.data as Row[])
      paginationState.setTotalCount(res.count || 0)
    }
    setSelected([])
  }, [supabase, paginationState.currentPage, schemaref, tableref])

  useEffect(() => {
    fetchListElements()
  }, [fetchListElements])

  return (
    <div>
      <RowDelete
        show={rowDeleteVisible}
        rows={rowsToDelete}
        onDone={() => {
          setSelected([])
          setRowDeleteVisible(false)
        }}
        onSuccess={() => {
          fetchListElements()
        }}
      />

      <div className="flex justify-between items-center my-3 h-9 ps-3">
        { selected.length
          ? (
            <SelectedCounter
              total={selected.length}
              what={['row', 'rows']}
              deselect={() => setSelected([])}
              className="min-w-[12rem]"
              contextualActions={(
                <Button
                  variant="outline-secondary"
                  className="p-2 border"
                  onClick={() => {
                    setRowsToDelete({
                      schema: schemaref,
                      table: tableref,
                      rows: selected.map((id) => (rows[id])),
                    })
                    setRowDeleteVisible(true)
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
      </div>

      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.SelectAllHeaderCell
              state={
              // eslint-disable-next-line no-nested-ternary
              (selected.length > 0 && selected.length === rows.length) ? 'checked'
                : (selected.length === 0 ? 'unchecked' : 'undetermined')
            }
              onPressed={() => {
                if (selected.length !== rows.length) {
                  setSelected(rows.map((_, i) => (i)))
                } else {
                  setSelected([])
                }
              }}
            />
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

            <Table.HeaderCell className="w-4" />
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {rows.map((listElement, idx) => (
            <Table.Row
              key={idx} // eslint-disable-line react/no-array-index-key
              aria-controls="example-collapse-text"
              style={{ cursor: 'pointer' }}
            >
              <Table.SelectDataCell
                checked={selected.includes(idx)}
                onPressed={() => {
                  if (selected.includes(idx)) {
                    setSelected(selected.filter((e) => (e !== idx)))
                  } else {
                    setSelected([...selected, idx])
                  }
                }}
              />
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
                return (
                  <Table.DataCell
                    key={columnName}
                    maxWidth={maxWidth}
                    copyValue={valueText}
                  >
                    {valueText}
                  </Table.DataCell>
                )
              })}
              <Table.DataCell alignItems="right">
                <Table.ActionButton
                  onClick={(e) => {
                    e.stopPropagation()
                    setRowsToDelete({
                      schema: schemaref,
                      table: tableref,
                      rows: [listElement],
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

      <div className="flex justify-end mt-2">
        <Pagination
          {...paginationState.paginationProps}
        />
      </div>
    </div>
  )
}
