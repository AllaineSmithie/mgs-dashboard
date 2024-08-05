/*************************************************************************/
/*  logs.tsx                                                             */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import Dropdown from '@webapps-common/UI/Dropdown/Dropdown'
import Button from '@webapps-common/UI/Button'
import Form from '@webapps-common/UI/Form/Form'
import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import withSchema from 'src/utils/withSchema'
import Table from '@webapps-common/UI/Table/Table'
import SimpleCounter from '@webapps-common/UI/Table/SimpleCounter'
import MainLayout from '@components/MainLayout'

export default function Logs() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Multiplayer' }],
        breadcrumbCurrentText: 'Logs',
      }}
    >
      <LogList />
    </MainLayout>
  )
}

export type LogLine = {
  id: string;
  log_name: string;
  ts: Date;
  data: string;
}

function LogList() {
  const [logs, setLogs] = useState<LogLine[]>([])
  const [logNames, setLogNames] = useState<string[]>([])
  const [selectedLogNames, setSelectedLogNames] = useState<string[]>([])
  const [logNameFilter, setLogNameFilter] = useState<string>('')
  const [logFilter, setLogFilter] = useState<string>('')

  const [isTailing, setTailing] = useState<boolean>(false)

  const [totalCount, setTotalCount] = useState(0)

  const supabase = useSupabaseClient()

  const fetchLogNames = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online').from('gameserver_log').select('name')
    let data:string[] = []
    if (res.error) {
      toast.error(`Request failed: ${res.error?.message}`)
    } else {
      data = res.data.map((e) => (e.name))
    }
    setLogNames(data)
  }, [supabase])

  const fetchLogs = useCallback(async () => {
    const req = withSchema(supabase, 'w4online').from('gameserver_log_entry').select().order('ts', { ascending: false })
    if (selectedLogNames.length > 0) {
      req.in('log_name', selectedLogNames)
    }
    const res = await req
    if (res.error) {
      toast.error(`Request failed: ${res.error?.message}`)
      setLogs([])
      return
    }
    setLogs(res.data as LogLine[])

    setTotalCount(res.data.length)
  }, [supabase, selectedLogNames])

  const filteredLogs = useMemo(() => {
    let filtered:LogLine[] = logs
    if (selectedLogNames.length > 0) {
      filtered = filtered.filter((l) => selectedLogNames.includes(l.log_name))
    }
    if (logFilter.length > 0) {
      filtered = filtered.filter((l) => l.data.indexOf(logFilter) !== -1)
    }
    return filtered
  }, [logs, selectedLogNames, logFilter])

  const startLiveTail = useCallback(async () => {
    supabase.realtime
      .channel('log-msgs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'w4online',
          table: 'gameserver_log_entry',
        },
        (payload) => {
          const tmp:LogLine[] = [payload.new as LogLine, ...logs]
          setLogs(tmp)
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Ovverrides old logs, just in case we missed something since when the page loaded
          fetchLogNames()
          setTailing(true)
        } else {
          setTailing(false)
        }
      })
  }, [supabase, logs, fetchLogNames, setTailing])

  const stopLiveTail = useCallback(async () => {
    supabase.realtime
      .channel('log-msgs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'w4online',
          table: 'gameserver_log_entry',
        },
        (payload) => {
          const tmp:LogLine[] = [payload.new as LogLine, ...logs]
          setLogs(tmp)
        },
      )
      .unsubscribe()
  }, [logs, supabase])

  const toggleLiveTail = useCallback(async () => {
    if (isTailing) {
      stopLiveTail()
    } else {
      startLiveTail()
    }
  }, [isTailing, startLiveTail, stopLiveTail])

  useEffect(() => {
    fetchLogs()
    fetchLogNames()
  }, [fetchLogs, fetchLogNames])

  return (
    <>
      <div className="tw-flex tw-justify-between">
        <Dropdown>
          <Dropdown.Toggle>
            Log name
          </Dropdown.Toggle>

          <Dropdown.Menu className="tw-max-h-[500px]" overflow="scroll">
            <Dropdown.Item
              className="tw-cursor-default hover:tw-bg-transparent dark:hover:tw-bg-transparent"
              onClick={(e) => e.stopPropagation()}
              closeOnClick={false}
            >
              <Form.Input id="logNameFilter" onChange={(e) => setLogNameFilter(e.target.value)} />
            </Dropdown.Item>
            <Dropdown.Divider />
            {
                logNames.map((logName) => (
                  (logNameFilter.length === 0 || logName.indexOf(logNameFilter) !== -1)
                    ? (
                      <Dropdown.Item
                        key={logName}
                        active={(selectedLogNames.includes(logName))}
                        onClick={() => {
                          if (selectedLogNames.includes(logName)) {
                            const index = selectedLogNames.indexOf(logName)
                            const temp = [...selectedLogNames]
                            temp.splice(index, 1)
                            setSelectedLogNames(temp)
                          } else {
                            setSelectedLogNames([logName, ...selectedLogNames])
                          }
                        }}
                      >
                        {logName}
                      </Dropdown.Item>
                    ) : (
                      null
                    )
                ))
              }
          </Dropdown.Menu>
        </Dropdown>
        <Form.Input
          id="logFilter"
          className="tw-ml-2 tw-max-w-[500px]"
          placeholder="Filter log line"
          onChange={(e) => setLogFilter(e.target.value)}
        />
        <Button
          variant="primary"
          onClick={() => {
            toggleLiveTail()
          }}
        >
          <FontAwesomeIcon icon={isTailing ? faPause : faPlay} fixedWidth />
          {' '}
          Live logs
        </Button>
      </div>
      <div>
        <SimpleCounter total={totalCount} />
        <Table className="tw-mt-3">
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeaderCell className="tw-w-2/12">Name</Table.HeaderCell>
              <Table.HeaderCell className="tw-w-2/12">Timestamp</Table.HeaderCell>
              <Table.HeaderCell className="tw-w-8/12">Data</Table.HeaderCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {filteredLogs.map((logLine) => (
              <Table.Row
                key={logLine.id}
              >
                <Table.DataCell>
                  {logLine.log_name}
                </Table.DataCell>
                <Table.DataCell>
                  {logLine.ts.toString().slice(0, -7)}
                </Table.DataCell>
                <Table.DataCell>
                  {logLine.data}
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </>
  )
}
