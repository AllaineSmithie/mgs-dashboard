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
        <div className="tw-flex tw-mb-3 tw-gap-8 tw-justify-between">

          <div className="tw-flex tw-flex-1">
            <div className="tw-flex tw-w-[42px] tw-h-[42px] tw-flex-shrink-0 tw-bg-surface-100 tw-border-r-0 tw-rounded-md tw-rounded-r-none tw-items-center tw-justify-center tw-border-border-secondary dark:tw-border-border tw-border">
              <FontAwesomeIcon icon={faSearch} fixedWidth />
            </div>
            <Form.Input
              placeholder="Filter"
              aria-label="Filter"
              aria-describedby="basic-addon1"
              className="tw-rounded-none tw-h-[42px]"
            />
            <DropdownButton
              variant="outline-secondary"
              title="Platform"
              id="input-group-dropdown-2"
              className="tw-rounded-none tw-border-l-0 tw-border-r-0"
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
              className="tw-rounded-l-none"
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
        <div className="tw-flex tw-mb-3 tw-gap-2">
          <div className="tw-flex-1">
            <SessionStartedPerDay />
          </div>
          <div className="tw-flex-1">
            <SessionTopPerCountry />
          </div>
        </div>
        <div className="tw-flex tw-mb-3 tw-gap-2">
          <div className="tw-flex-1">
            <SessionDuration />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
