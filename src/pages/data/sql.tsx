/*************************************************************************/
/*  sql.tsx                                                              */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import MainLayout from '@components/MainLayout'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import Button from '@webapps-common/UI/Button'
import Table from '@webapps-common/UI/Table/Table'
import usePGMetaClient from 'src/hooks/usePGMetaClient'

const SQLEditor = dynamic(() => import('@components/SQLEditor/SQLEditor'), { ssr: false })

type Row = {
  [key: string]: unknown;
}

export default function SQLEditorPage() {
  const [editorValue, setEditorValue] = useState('')
  const [results, setResults] = useState('')
  const [dataResults, setDataResults] = useState<Row[]>([])
  const [processing, setProcessing] = useState<boolean>(false)
  const { query } = usePGMetaClient()

  async function executeQuery() {
    if (processing) return
    setProcessing(true)
    setResults('Executing query...')
    setDataResults([])
    try {
      const { data, error } = await query.executeQuery(editorValue)
      if (error) {
        setResults(`Error executing query: ${error}`)
        setProcessing(false)
        return
      }
      let successMessage = 'Successfully executed query.'
      if (data.length) {
        setDataResults(data)
      } else {
        successMessage = `${successMessage} No results to display.`
      }
      setResults(successMessage)
    } catch (error) {
      setResults('Error executing query: Failed to fetch data')
    }
    setProcessing(false)
  }
  function handleEditorChange(value?:string) {
    setEditorValue(value || '')
  }
  const maxRows = 100
  let resultsHeading = 'Results:'
  if (dataResults.length > maxRows) {
    resultsHeading = `Results (displaying the first ${maxRows} rows out of ${dataResults.length}):`
  }
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'SQL Editor',
      }}
    >
      <div className="flex flex-col h-full max-h-[75vh]">
        <h1 className="text-foreground-secondary">Enter SQL Query:</h1>
        <div className="flex-grow mt-2 rounded-md overflow-hidden">
          <SQLEditor
            onChange={handleEditorChange}
            executeQuery={executeQuery}
            defaultValue=""
            value={editorValue}
          />
        </div>
        <div className="mt-2 flex gap-2">
          <div className="flex-grow bg-surface-100 px-4 py-2 overflow-y-auto rounded text-foreground-secondary max-h-64">
            {results}
            {!results && <div className="text-foreground-muted">Execute your query to see the results here.</div>}
          </div>
          <Button
            className=""
            onClick={executeQuery}
            disabled={processing}
          >
            Run Query
          </Button>
        </div>
        {dataResults.length > 0 && (
          <>
            <h1 className="mt-2 text-foreground-secondary">{resultsHeading}</h1>
            <div className="flex-grow mt-2 overflow-y-auto rounded text-foreground-secondary max-h-64">
              <Table>
                <Table.Header>
                  <Table.HeaderRow>
                    {Object.keys(dataResults[0]).map((key) => (
                      <Table.HeaderCell key={key}>{key}</Table.HeaderCell>
                    ))}
                  </Table.HeaderRow>
                </Table.Header>
                <Table.Body>
                  {dataResults.slice(0, maxRows).map((row, i) => (
                    <Table.Row key={`${row.id}-${i}`}>
                      {Object.values(row).map((value, j) => {
                        let displayValue = ''
                        if (typeof value === 'object') {
                          displayValue = JSON.stringify(value)
                        } else {
                          displayValue = value as string
                        }
                        return (
                          <Table.DataCell key={`${value}-${j}`}>
                            {displayValue}
                          </Table.DataCell>
                        )
                      })}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}
