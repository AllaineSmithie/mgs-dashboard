/*************************************************************************/
/*  overview.tsx                                                         */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Form from '@webapps-common/UI/Form/Form'
import Dropdown from '@webapps-common/UI/Dropdown/Dropdown'
import DropdownButton from '@webapps-common/UI/Dropdown/DropdownButton'
import GlueRoundedGroup from '@webapps-common/UI/GlueRoundedGroup'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import MainLayout from '@components/MainLayout'

import SessionStartedPerDay from '@components/Graphs/SessionStartedPerDay'
import SessionDuration from '@components/Graphs/SessionDuration'
import SessionTopPerCountry from '@components/Graphs/SessionTopPerCountry'

export default function UserBehaviorOverview() {
  return (
    <MainLayout breadcrumb={{ breadcrumbCurrentText: 'Overview' }}>
      <div>
        <div className="flex mb-3 gap-8 justify-between">

          <div className="flex flex-1">
            <div className="flex w-[42px] h-[42px] flex-shrink-0 bg-surface-100 border-r-0 rounded-md rounded-r-none items-center justify-center border-border-secondary dark:border-border border">
              <FontAwesomeIcon icon={faSearch} fixedWidth />
            </div>
            <Form.Input
              placeholder="Filter"
              aria-label="Filter"
              aria-describedby="basic-addon1"
              className="rounded-none h-[42px]"
            />
            <DropdownButton
              variant="outline-secondary"
              title="Platform"
              id="input-group-dropdown-2"
              className="rounded-none border-l-0 border-r-0"
            >
              <Dropdown.Item href="#">
                <Form.Checkbox label="PC" checked={false} onChange={() => {}} />
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <Form.Checkbox label="Switch" checked={false} onChange={() => {}} />
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <Form.Checkbox label="PS4" checked={false} onChange={() => {}} />
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <Form.Checkbox label="Xbox" checked={false} onChange={() => {}} />
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <Form.Checkbox label="IOs" checked={false} onChange={() => {}} />
              </Dropdown.Item>
            </DropdownButton>

            <DropdownButton
              variant="outline-secondary"
              title="Region"
              id="input-group-dropdown-2"
              className="rounded-l-none"
            >
              <Dropdown.Item href="#">
                <Form.Checkbox label="Africa" checked={false} onChange={() => {}} />
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <Form.Checkbox label="North America" checked={false} onChange={() => {}} />
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <Form.Checkbox label="South America" checked={false} onChange={() => {}} />
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <Form.Checkbox label="Asia" checked={false} onChange={() => {}} />
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <Form.Checkbox label="Europe" checked={false} onChange={() => {}} />
              </Dropdown.Item>
            </DropdownButton>
          </div>

          <div>
            <GlueRoundedGroup>
              <DropdownButton
                variant="outline-secondary"
                title="Last 7 days"
                id="input-group-dropdown-2"
              >
                <Dropdown.Item href="#">This week</Dropdown.Item>
                <Dropdown.Item href="#">Last 7 days</Dropdown.Item>
                <Dropdown.Item href="#">This Month</Dropdown.Item>
                <Dropdown.Item href="#">Last 30 days</Dropdown.Item>
                <Dropdown.Item href="#">This year</Dropdown.Item>
                <Dropdown.Item href="#">All time</Dropdown.Item>
              </DropdownButton>
            </GlueRoundedGroup>
          </div>
        </div>
        <div className="flex mb-3 gap-2">
          <div className="flex-1">
            <SessionStartedPerDay />
          </div>
          <div className="flex-1">
            <SessionTopPerCountry />
          </div>
        </div>
        <div className="flex mb-3 gap-2">
          <div className="flex-1">
            <SessionDuration />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
