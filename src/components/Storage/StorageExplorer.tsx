/*************************************************************************/
/*  StorageExplorer.tsx                                                  */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import * as pathLib from 'path'
import React, {
  useEffect, useState, useCallback, MouseEventHandler,
} from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { FileObject } from '@supabase/storage-js'
import Table from '@webapps-common/UI/Table/Table'
import Button from '@webapps-common/UI/Button'
import GlueRoundedGroup from '@webapps-common/UI/GlueRoundedGroup'
import Spinner from '@webapps-common/UI/Spinner'
import Dropdown from '@webapps-common/UI/Dropdown/Dropdown'
import DropdownButton from '@webapps-common/UI/Dropdown/DropdownButton'
import Form from '@webapps-common/UI/Form/Form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDownWideShort,
  faArrowUpWideShort,
  faDownload, faFolder, faFolderPlus, faHouse, faMinus, faTrash, faUpload,
} from '@fortawesome/free-solid-svg-icons'
import prettyBytes from 'pretty-bytes'
import cn from '@webapps-common/utils/classNamesMerge'
import FolderCreate, {
  FolderCreated,
} from '@components/Forms/Buckets/FolderCreate'
import FileDelete, { FilesDeleted } from '@components/Forms/Buckets/FileDelete'
import FileUpload, {
  FilesUploaded,
} from '@components/Forms/Buckets/FileUpload'
import useOutsideClick from 'src/utils/useOutsideClick'
import getFAIconFromExtension from './getFAIconFromExtension'

type StorageExplorerListProps = {
  bucket: string;
  onRootClicked?: () => void;
  onSelectionChanged?: (folderPath: string, selection: FileObject[]) => void;
  defaultPath?: string;
  allowedFileExtensions?: string[];
  createBucketIfNotExisting?: boolean;
  doNotDeselectClassName?: string;
}
export default function StorageExplorer({
  bucket,
  onRootClicked,
  onSelectionChanged = () => {},
  defaultPath = '',
  allowedFileExtensions,
  createBucketIfNotExisting = false,
  doNotDeselectClassName = 'dont-deselect-files',
}: StorageExplorerListProps) {
  const supabase = useSupabaseClient()

  const defaultSplitPath = defaultPath.split('/').filter((el) => el)
  const [splitPath, setSplitPath] = useState<string[]>(defaultSplitPath)
  const splitPathToStringPath = (arr: string[]) => (arr.length > 0 ? pathLib.join(...arr) : '')

  // Modals
  const [filesToDelete, setFilesToDelete] = useState<FilesDeleted>({
    bucket,
    path: '',
    files: [],
  })
  const [fileDeleteVisible, setFileDeleteVisible] = useState(false)
  const [filesToUpload, setFilesToUpload] = useState<FilesUploaded>({
    bucket,
    path: '',
  })
  const [fileUploadVisible, setFileUploadVisible] = useState(false)
  const [folderToCreate, setFolderToCreate] = useState<FolderCreated>({
    bucket,
    path: '',
    name: '',
  })
  const [folderCreateVisible, setFolderCreateVisible] = useState(false)

  // States
  const [files, setFiles] = useState<FileObject[]>([])
  const [selected, setSelected] = useState<FileObject[]>([])
  const [showHiddenFile, setShowHiddenFiles] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  // Avoid deselecting on some components.
  useOutsideClick(doNotDeselectClassName, () => {
    setSelected([])
  })

  // Element List
  enum SortColumn {
    Name,
    CreationDate,
  }
  const [sortColumn, setSortColumn] = useState<SortColumn>(SortColumn.Name)
  const [sortOrderAsc, setSortOrderAsc] = useState<boolean>(true)
  const fetchListElements = useCallback(async () => {
    setLoading(true)
    const mapping = ['name', 'created_at']
    let list: FileObject[] = []
    let pageIndex = 0
    let shouldStop = false
    const pageSize = 100
    const countLimit = 10000
    while (!shouldStop) {
      /* eslint-disable-next-line no-await-in-loop */
      const res = await supabase.storage
        .from(bucket)
        .list(splitPathToStringPath(splitPath), {
          limit: pageSize,
          offset: pageSize * pageIndex,
          sortBy: {
            column: mapping[sortColumn as number],
            order: sortOrderAsc ? 'asc' : 'desc',
          },
        })
      if (res.error) {
        toast.error(`Could not retrieve file list: ${res.error.message}`)
        setLoading(false)
        return
      }
      pageIndex += 1
      if (!res.data || res.data.length === 0) {
        shouldStop = true
      } else {
        const filteredData = allowedFileExtensions
          ? res.data.filter(
            (el) => !el.created_at
                || allowedFileExtensions.includes(pathLib.extname(el.name)),
          )
          : res.data
        list = list.concat(filteredData)
        if (list.length >= countLimit || pageIndex * pageSize > countLimit) {
          toast.warning(
            `Could not retrieve all files, too many of them (limited to ${countLimit} entries)`,
          )
          shouldStop = true
        }
      }
    }

    // Update files
    setFiles(list.filter((el) => {
      if (showHiddenFile) {
        return true
      }
      return !el.name.startsWith('.')
    }))

    // Update breadcrumb
    setLoading(false)
  }, [
    supabase,
    bucket,
    sortColumn,
    sortOrderAsc,
    showHiddenFile,
    splitPath,
    allowedFileExtensions,
  ])

  useEffect(() => {
    fetchListElements()
  }, [fetchListElements])

  useEffect(() => {
    onSelectionChanged(pathLib.join(...splitPath), selected)
  }, [selected, onSelectionChanged, splitPath])

  function getSortIcon(column: SortColumn) {
    if (sortColumn === column) {
      return sortOrderAsc ? faArrowDownWideShort : faArrowUpWideShort
    }
    return faMinus
  }

  return (
    <div>
      <FileDelete
        show={fileDeleteVisible}
        deleted={filesToDelete}
        onCancel={() => setFileDeleteVisible(false)}
        onSuccess={() => {
          setFileDeleteVisible(false)
          fetchListElements()
        }}
        modalProps={{
          className: doNotDeselectClassName,
        }}
      />
      <FileUpload
        show={fileUploadVisible}
        uploaded={filesToUpload}
        createBucketIfNotExisting={createBucketIfNotExisting}
        onCancel={() => setFileUploadVisible(false)}
        onSuccess={() => {
          setFileUploadVisible(false)
          fetchListElements()
        }}
        allowedFileExtensions={allowedFileExtensions}
        modalProps={{
          className: doNotDeselectClassName,
        }}
      />
      <FolderCreate
        show={folderCreateVisible}
        created={folderToCreate}
        createBucketIfNotExisting={createBucketIfNotExisting}
        onCancel={() => setFolderCreateVisible(false)}
        onSuccess={() => {
          setFolderCreateVisible(false)
          fetchListElements()
        }}
        modalProps={{
          className: doNotDeselectClassName,
        }}
      />

      <div className={cn('tw-mb-3 tw-flex tw-justify-between tw-items-center', doNotDeselectClassName)}>
        <FolderBreadcrumbs
          bucket={bucket}
          folderChain={splitPath}
          onRootClicked={onRootClicked}
          onElementClick={(index) => {
            setSplitPath(splitPath.slice(0, index))
          }}
        />
        <div className="tw-mx-auto" />
        <GlueRoundedGroup>
          <Button
            variant="primary"
            onClick={() => {
              setFilesToUpload({
                bucket,
                path: pathLib.join(...splitPath),
              })
              setFileUploadVisible(true)
            }}
          >
            <FontAwesomeIcon icon={faUpload} fixedWidth />
            {' '}
            Upload files
          </Button>

          <DropdownButton
            title="Actions"
            variant="secondary"
            className="tw-rounded-l-none"
            placement="right"
            onSelect={(e) => {
              if (e === 'sort_by_name') {
                if (sortColumn === SortColumn.Name) {
                  setSortOrderAsc(!sortOrderAsc)
                } else {
                  setSortColumn(SortColumn.Name)
                  setSortOrderAsc(true)
                }
              } else if (e === 'sort_by_created_date') {
                if (sortColumn === SortColumn.CreationDate) {
                  setSortOrderAsc(!sortOrderAsc)
                } else {
                  setSortColumn(SortColumn.CreationDate)
                  setSortOrderAsc(true)
                }
              } else if (e === 'delete') {
                setFilesToDelete({
                  bucket,
                  path: pathLib.join(...splitPath),
                  files: selected.map((file) => ({
                    name: file.name,
                    isDir: false,
                  })),
                })
                setFileDeleteVisible(true)
              } else if (e === 'create_folder') {
                setFolderToCreate({
                  bucket,
                  path: pathLib.join(...splitPath),
                  name: '',
                })
                setFolderCreateVisible(true)
              } else if (e === 'show_hidden') {
                setShowHiddenFiles(!showHiddenFile)
              }
            }}
          >
            <Dropdown.Item eventKey="delete" disabled={selected.length <= 0}>
              <FontAwesomeIcon icon={faTrash} fixedWidth />
              {' '}
              Delete
            </Dropdown.Item>
            <Dropdown.Item eventKey="create_folder">
              <FontAwesomeIcon icon={faFolderPlus} fixedWidth />
              {' '}
              Create folder
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item eventKey="sort_by_name">
              <FontAwesomeIcon icon={getSortIcon(SortColumn.Name)} fixedWidth />
              {' '}
              Sort by name
            </Dropdown.Item>
            <Dropdown.Item eventKey="sort_by_created_date">
              <FontAwesomeIcon icon={getSortIcon(SortColumn.CreationDate)} fixedWidth />
              {' '}
              Sort by creation date
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item eventKey="show_hidden" className="hover:tw-bg-transparent dark:hover:tw-bg-transparent">
              <Form.Toggle checked={showHiddenFile} readOnly label="Show hidden files" />
            </Dropdown.Item>
          </DropdownButton>
        </GlueRoundedGroup>
      </div>
      {loading ? <div className="tw-flex tw-items-center tw-justify-center"><Spinner large /></div>
        : (
          <Table className="file-list">
            <Table.Header className="border-bottom">
              <Table.HeaderRow>
                <Table.HeaderCell>File</Table.HeaderCell>
                <Table.HeaderCell>Size</Table.HeaderCell>
                <Table.HeaderCell className="tw-w-56">Created</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.HeaderRow>
            </Table.Header>
            <Table.Body>
              {
                files?.map((file) => (
                  <FileEntry
                    key={file.name}
                    file={file}
                    selected={selected.includes(file)}
                    onSelected={(e) => {
                      e.preventDefault()
                      setSelected([file])
                    }}
                    onActivated={async (e) => {
                      e.preventDefault()
                      const isDir = !file.id
                      if (isDir) {
                        // Open a given directory.
                        setSplitPath(splitPath.concat([file.name]))
                      }
                    }}
                    downloadAction={async () => {
                      // Download the file
                      const res = await supabase.storage
                        .from(bucket)
                        .download(
                          pathLib.join(splitPathToStringPath(splitPath), file.name),
                        )
                      if (res.error) {
                        toast.error(
                          `Could not download file(s): ${res.error.message}`,
                        )
                        return
                      }

                      // Create a link and click it
                      const link = document.createElement('a')
                      link.href = window.URL.createObjectURL(res.data)
                      link.setAttribute('download', file.name)
                      document.body.appendChild(link)
                      link.click()
                      link.parentNode?.removeChild(link)
                    }}
                  />
                ))
              }
            </Table.Body>
          </Table>
        )}
    </div>
  )
}

type FileEntryProps = {
  file: FileObject;
  selected?: boolean;
  onSelected?: MouseEventHandler<HTMLTableRowElement>;
  onActivated?: MouseEventHandler<HTMLTableRowElement>;
  downloadAction: () => void;
}
function FileEntry({
  file,
  selected = false,
  onSelected,
  onActivated,
  downloadAction,
} : FileEntryProps) {
  const isDir = !file.id
  const extension = pathLib.extname(file.name)
  const icon = isDir ? faFolder : getFAIconFromExtension(extension)
  return (
    <Table.Row
      onClick={onSelected}
      onDoubleClick={onActivated}
      className="tw-h-12"
      selected={selected}
      style={{
        cursor: 'pointer',
      }}
    >
      <Table.DataCell>
        <FontAwesomeIcon icon={icon} fixedWidth />
        {' '}
        {file.name}
      </Table.DataCell>
      <Table.DataCell>{isDir ? '-' : prettyBytes(file.metadata?.size)}</Table.DataCell>
      <Table.DataCell>{isDir ? '-' : file.created_at}</Table.DataCell>
      <Table.DataCell alignItems="right">
        {isDir ? ''
          : (
            <Table.ActionButton
              title="Download"
              onClick={(e) => {
                e.preventDefault()
                downloadAction()
              }}
            >
              <FontAwesomeIcon icon={faDownload} />
            </Table.ActionButton>
          )}
      </Table.DataCell>
    </Table.Row>
  )
}
type FolderBreadcrumbsProps = {
  bucket: string;
  folderChain: string[];
  onRootClicked?: () => void;
  onElementClick?: (index: number) => void;
}
function FolderBreadcrumbs({
  bucket,
  folderChain,
  onRootClicked,
  onElementClick,
}: FolderBreadcrumbsProps) {
  return (
    <ul className="tw-inline-flex tw-m-0 tw-p-0 tw-list-none folder-chain-breadcrumbs">
      {onRootClicked
        && (
        <li>
          <Button
            variant="no-background"
            className="tw-p-0"
            onClick={onRootClicked}
          >
            <FontAwesomeIcon icon={faHouse} fixedWidth />
          </Button>
        </li>
        )}
      {
        ([bucket].concat(folderChain)).map((name, index) => (
          /* eslint-disable-next-line react/no-array-index-key */
          <li key={name + index}>
            <Button
              variant="no-background"
              className={cn(
                'tw-p-0',
                { "tw-ms-2 before:tw-content-['/']": index > 0 || onRootClicked },
              )}
              onClick={() => {
                if (onElementClick) {
                  onElementClick(index)
                }
              }}
            >
              {name}
            </Button>
          </li>
        ))
      }
    </ul>
  )
}
