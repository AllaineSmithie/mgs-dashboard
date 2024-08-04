/*************************************************************************/
/*  logs.tsx                                                             */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import Button from '@webapps-common/UI/Button'
import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
} from 'react'
import { toast } from 'react-toastify'
import {
  AutoSizer, List, ListRowRenderer,
} from 'react-virtualized'
import * as csv from 'csv-stringify/sync'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import withSchema from 'src/utils/withSchema'
import Ansi from '@curvenote/ansi-to-react'
import SimpleCounter from '@webapps-common/UI/Table/SimpleCounter'
import MainLayout from '@components/MainLayout'
import {
  KeyValueSearchContextProvider,
  KeyValueSearchContextProviderRef,
  OnCompletedCallback,
  OnSearchArgs,
  useKeyValueSearchContext,
} from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchContextProvider'
import KeyValueSearchBar from '@webapps-common/UI/Table/KeyValueSearch/KeyValueSearchBar'
import FormCheckbox from '@webapps-common/UI/Form/FormCheckbox'
import DropdownButton from '@webapps-common/UI/Dropdown/DropdownButton'
import Dropdown from '@webapps-common/UI/Dropdown/Dropdown'
import Spinner from '@webapps-common/UI/Spinner'
import { PostgrestSingleResponse, RealtimeChannel } from '@supabase/supabase-js'
import cn from '@webapps-common/utils/classNamesMerge'
import unraw from 'unraw'

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
type RawLogLine = Omit<LogLine, 'date'> & { date: string }
function rawToLogLine(rawLogLine: RawLogLine) : LogLine {
  return {
    id: rawLogLine.id,
    log_name: rawLogLine.log_name,
    ts: new Date(rawLogLine.ts),
    data: rawLogLine.data,
  }
}

function LogList() {
  // Log lines.
  const [logs, setLogs] = useState<LogLine[]>([])

  // Live logs.
  const [isLiveLogsEnabled, setLiveLogsEnabled] = useState<boolean>(false)
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const realtimeChannelRef = useRef<RealtimeChannel | null>()

  // Selected log.
  const [selectedLogName, setSelectedLogName] = useState<string>('')

  // Display.
  const [displayTimestamps, setDisplayTimestamps] = useState<boolean>(true)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const supabase = useSupabaseClient()

  // Ref to the key/value search context.
  const keyValueSearchContextProviderRef = useRef<KeyValueSearchContextProviderRef>(null)

  // Defined at the page level for conviniency.
  const logListContainerRef = useRef<HTMLDivElement | null>(null)

  const onSearch = useCallback(({
    searchTerms,
    keyValues,
  } : OnSearchArgs) => {
    let query = withSchema(supabase, 'w4online').from('gameserver_log_entry').select().order('ts', { ascending: false })

    // Search.
    searchTerms.forEach((term) => {
      query = query.ilike('data', `%${term}%`)
    })

    // Filter.
    const logName = ('log-source' in keyValues && keyValues['log-source'].length > 0) ? keyValues['log-source'][0] : ''
    if (logName) {
      query = query.in('log_name', [logName])
    }
    setSelectedLogName(logName)
    setIsLoading(true)
    return query
  }, [supabase])

  const onCompleted : OnCompletedCallback<PostgrestSingleResponse<unknown>> = ({ result }) => {
    setIsLoading(false)

    if (result.error) {
      toast.error(`Could not access backup list: ${result.error?.message}`)
      setLogs([])
      return
    }

    const rawResData = result.data as RawLogLine[]
    setLogs(rawResData.map((rawLogLine) => rawToLogLine(rawLogLine)) as LogLine[])
  }

  const updateLiveLogs = useCallback(async () => {
    // Unsubscribe
    if (realtimeChannelRef.current) {
      setIsBusy(true)
      const status = await supabase.removeChannel(realtimeChannelRef.current)
      if (status === 'ok') {
        realtimeChannelRef.current = null
      } else {
        toast.error('Could not unsubscribe to updates.')
      }
      setIsBusy(false)
    }

    // Subscribe
    if (isLiveLogsEnabled) {
      setIsBusy(true)

      // Refetch all logs to avois lacking logs.
      await keyValueSearchContextProviderRef?.current?.triggerSearch()

      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe()
      }
      const channel = supabase.realtime
        .channel('log-msgs')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'w4online',
            table: 'gameserver_log_entry',
          },
          (e) => {
            const rawLogLine = e.new as RawLogLine
            if (!selectedLogName || rawLogLine.log_name === selectedLogName) {
              setLogs((prevRawLogs) => ([rawToLogLine(rawLogLine)].concat(prevRawLogs)))
            }
          },
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            toast.error('An error occured during live logging.')
          }
          setIsBusy(false)
        })
      if (!channel) {
        toast.error('Could not subscribe to logs updates.')
      }
      realtimeChannelRef.current = channel
      setIsBusy(false)
    }
  }, [supabase, selectedLogName, isLiveLogsEnabled])

  useEffect(() => {
    updateLiveLogs()
  }, [isLiveLogsEnabled, updateLiveLogs])

  const generateFileNameWithNoExtension = (logName : string) => {
    let fileName = logName ? `${logName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-` : ''
    fileName += (new Date()).toISOString()
    fileName += '-logs'
    return fileName
  }

  function downloadFile(fileName: string, data: string, blobType: string) {
    // Create a link and click it
    const link = document.createElement('a')
    const blob = new Blob([data], {
      type: blobType,
    })
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
  }

  const downloadAsCSV = useCallback(() => {
    const fileName = `${generateFileNameWithNoExtension(selectedLogName)}.csv`
    const logsAsArray = logs.map((log) => {
      const arr : string[] = []
      if (!selectedLogName) {
        arr.push(log.log_name)
      }
      if (displayTimestamps) {
        const dateString = log.ts.toISOString()
        arr.push(dateString)
      }
      arr.push(log.data)
      return arr
    })
    const data = csv.stringify(logsAsArray.reverse())
    downloadFile(fileName, data, 'text/csv')
  }, [logs, selectedLogName, displayTimestamps])

  const downloadAsText = useCallback(() => {
    const fileName = `${generateFileNameWithNoExtension(selectedLogName)}.txt`
    const data = logs.map((l) => (l.data)).reverse().join('\n')
    downloadFile(fileName, data, 'text/plain')
  }, [logs, selectedLogName])

  const allowDownloadAsText = selectedLogName && logs.length > 0

  return (
    <KeyValueSearchContextProvider
      onSearch={onSearch}
      onCompleted={onCompleted}
      isResultAbortError={(result) => (result.error && result.error.code === '20') as boolean}
      kvRef={keyValueSearchContextProviderRef}
    >
      <div className="h-full grow flex flex-col">
        <div className="flex gap-3">
          <KeyValueSearchBar />
          <Button
            variant={isLiveLogsEnabled && !isBusy ? 'primary' : 'secondary'}
            disabled={isBusy}
            onClick={() => {
              setLiveLogsEnabled((e) => (!e))
            }}
          >
            <div className={cn('absolute ', { invisible: !isBusy })}>
              <Spinner />
            </div>
            <div className={cn({ invisible: isBusy })}>
              <FontAwesomeIcon
                icon={isLiveLogsEnabled && !isBusy ? faPause : faPlay}
                fixedWidth
              />
              {' '}
              Live logs
            </div>
          </Button>
          <DropdownButton
            title={<FontAwesomeIcon icon={faDownload} fixedWidth />}
            className="h-full"
            placement="right"
          >
            <Dropdown.Item
              disabled={logs.length === 0}
              onClick={downloadAsCSV}
            >
              Download CSV of visible logs
              {logs.length === 0 && ' (no logs)'}
            </Dropdown.Item>
            <Dropdown.Item
              disabled={!allowDownloadAsText}
              onClick={downloadAsText}
            >
              {allowDownloadAsText ? `Download raw logs for source ${selectedLogName}` : 'Download raw logs'}
              {!selectedLogName && ' (no log source selected)'}
              {selectedLogName && !(logs.length > 0) && ' (no logs)'}
            </Dropdown.Item>
          </DropdownButton>
        </div>
        <div className="mt-3 flex justify-between">
          <SimpleCounter total={logs.length} />
          <FormCheckbox
            label="Display timestamps"
            onChange={() => { setDisplayTimestamps(!displayTimestamps) }}
            checked={displayTimestamps}
          />
        </div>
        <div className="grow flex" ref={logListContainerRef}>
          <AutoSizer>
            {({ height, width }) => (!isLoading
              ? (
                <LogsVirtualizedList
                  height={height}
                  width={width}
                  showLogName={!selectedLogName}
                  showTimestamp={displayTimestamps}
                  logs={logs}
                />
              ) : (
                <div className="absolute left-0 top-0 h-full w-full flex mt-3 content-center justify-center">
                  <Spinner large />
                </div>
              ))}
          </AutoSizer>
        </div>
      </div>
    </KeyValueSearchContextProvider>
  )
}

function LogsVirtualizedList({
  width,
  height,
  showLogName,
  showTimestamp,
  logs,
}: {
  width : number;
  height : number;
  showLogName: boolean;
  showTimestamp: boolean;
  logs: LogLine[];
}) {
  const { setKeyValue } = useKeyValueSearchContext()

  const rowRenderer : ListRowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    style, // Style object to be applied to row (to position it)
  }) => {
    const logLine = logs[index]
    const handleClick = () => {
      setKeyValue({
        key: 'log-source',
        value: logLine.log_name,
        replace: true,
      })
    }
    return (
      <div
        key={key}
        style={style}
        className="flex gap-5 flex-nowrap"
      >
        <div className="basis-20 flex-none text-right bg-surface-200 text-foreground-muted select-none">
          {index + 1}
        </div>
        { showLogName
        && (
          <span
            // This needs to be span for copy-pasting.
            tabIndex={0}
            role="button"
            className="basis-[15%] flex-none whitespace-nowrap cursor-pointer text-left underline select-text inline text-foreground-secondary"
            onClick={handleClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleClick()
              }
            }}
          >
            {logLine.log_name}
            {'\t' /* Usefulk for copy-pasting */}
          </span>
        )}
        {showTimestamp
        && (
        <span className="flex-none whitespace-nowrap text-foreground-muted">
          {logLine.ts.toLocaleString()}
          {'\t' /* Usefulk for copy-pasting */}
        </span>
        )}
        <span className="grow whitespace-nowrap">
          <Ansi>
            {unraw(logLine.data, true)}
          </Ansi>
        </span>
      </div>
    )
  }
  return (
    <List
      height={height}
      width={width}
      overscanRowCount={50}
      className="mt-3 font-mono bg-surface-100 border border-border rounded-md"
      style={{ overflow: 'scroll' }}
      rowCount={logs.length}
      rowHeight={25}
      rowRenderer={rowRenderer}
      containerStyle={{ overflow: 'visible' }}
    />
  )
}
