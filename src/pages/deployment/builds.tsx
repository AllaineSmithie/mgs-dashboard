/*************************************************************************/
/*  builds.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Table from '@webapps-common/UI/Table/Table'
import Button from '@webapps-common/UI/Button'
import Spinner from '@webapps-common/UI/Spinner'
import Badge from '@webapps-common/UI/Badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronRight,
  faDownload,
  faRotateRight,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import {
  faFileLines,
} from '@fortawesome/free-regular-svg-icons'
import React, { useEffect, useState } from 'react'
import Pagination from '@webapps-common/UI/Pagination'
import MainLayout from '@components/MainLayout'
import PaginationCounter from '@webapps-common/UI/Table/PaginationCounter'

export default function Builds() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'Builds',
      }}
    >
      <BuildList />
    </MainLayout>
  )
}

type CIBuild = {
  id: string;
  source: string;
  target: string;
  status: string;
  requestedDate: string;
  buildDate: string;
  buildDuration: string;
}

function BuildList({ itemsPerPage = 30 }) {
  const [listElements, setListElements] = useState<CIBuild[]>([])

  const [expanded, setExpanded] = useState<string>('')

  const [pageOffset, setPageOffset] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchListElements = async () => {
    const list : CIBuild[] = [
      {
        id: '0',
        source: '4.0-RC2',
        target: 'Switch - template_release',
        status: 'Ready',
        requestedDate: 'Today',
        buildDate: 'Today',
        buildDuration: '15 minutes 25 seconds',
      },
      {
        id: '1',
        source: 'commit 568af4',
        target: 'XBox - template_release',
        status: 'Building',
        requestedDate: 'Today',
        buildDate: 'Not applicable',
        buildDuration: 'Not applicable',
      },
      {
        id: '2',
        source: '3.5.0',
        target: 'Windows - editor',
        status: 'Scheduled',
        requestedDate: 'Today',
        buildDate: 'Not applicable',
        buildDuration: 'Not applicable',
      },
      {
        id: '3',
        source: '3.5.0',
        target: 'Linux - x86_64 - editor',
        status: 'Scheduled',
        requestedDate: 'Today',
        buildDate: 'Not applicable',
        buildDuration: 'Not applicable',
      },
      {
        id: '4',
        source: '3.5.0',
        target: 'Linux - ARM - editor',
        status: 'Scheduled',
        requestedDate: 'Today',
        buildDate: 'Not applicable',
        buildDuration: 'Not applicable',
      },
    ]
    setListElements(list)
    setPageCount(1)
    setTotalCount(list.length)
  }

  const statusBadge = (status : string) => {
    if (status === 'Ready') {
      return <Badge bg="success">{status}</Badge>
    } if (status === 'Building') {
      return (
        <Badge bg="warning">
          <Spinner />
          {' '}
          {status}
        </Badge>
      )
    }
    return <Badge bg="secondary">{status}</Badge>
  }

  useEffect(() => { fetchListElements() }, [pageOffset, itemsPerPage])

  return (
    <div>
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
        <PaginationCounter
          from={pageOffset * itemsPerPage}
          to={pageOffset + listElements.length}
          total={totalCount}
        />
        <Button variant="primary" onClick={() => {}}>
          <FontAwesomeIcon icon={faPlus} fixedWidth />
          {' '}
          New build
        </Button>
      </div>

      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell style={{ width: '2%' }}> </Table.HeaderCell>
            <Table.HeaderCell>Build</Table.HeaderCell>
            <Table.HeaderCell>Target</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {listElements.map((listElement) => (
            <>
              <Table.Row
                onClick={() => { setExpanded(expanded === listElement.id ? '' : listElement.id) }}
                aria-controls="example-collapse-text"
                aria-expanded={expanded === listElement.id}
                style={{ cursor: 'pointer' }}
                className="tw-h-16"
              >
                <Table.DataCell>
                  {
                    expanded !== listElement.id
                    && <FontAwesomeIcon icon={faChevronRight} fixedWidth />
                  }
                  {
                    expanded === listElement.id
                    && <FontAwesomeIcon icon={faChevronDown} fixedWidth />
                  }
                </Table.DataCell>
                <Table.DataCell>{listElement.source}</Table.DataCell>
                <Table.DataCell>{listElement.target}</Table.DataCell>
                <Table.DataCell>{statusBadge(listElement.status)}</Table.DataCell>
                <Table.DataCell>
                  {
                        listElement.status === 'Ready' && (
                        <>
                          <FontAwesomeIcon icon={faDownload} fixedWidth />
                          <FontAwesomeIcon icon={faRotateRight} fixedWidth />
                        </>
                        )
                  }
                  {
                        (listElement.status === 'Ready' || listElement.status === 'Building')
                        && (
                          <FontAwesomeIcon icon={faFileLines} fixedWidth />
                        )
                  }
                </Table.DataCell>
              </Table.Row>
              <Table.CollapsibleRow colCount={6} expanded={expanded === listElement.id} id={`collapsible-${listElement.id}`}>
                <div style={{ padding: '20px' }}>
                  <p>
                    <b>Request date:</b>
                    {' '}
                    {listElement.requestedDate}
                  </p>
                  <p>
                    <b>Build date:</b>
                    {' '}
                    {listElement.buildDate}
                  </p>
                  <p>
                    <b>Build duration:</b>
                    {' '}
                    {listElement.buildDuration}
                  </p>
                </div>
              </Table.CollapsibleRow>
            </>
          ))}
        </Table.Body>
      </Table>

      <div className="tw-flex tw-justify-end tw-mt-3">
        <Pagination
          pageOffset={pageOffset}
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={(currentPage) => {
            setPageOffset(currentPage)
          }}
        />
      </div>
    </div>
  )
}
