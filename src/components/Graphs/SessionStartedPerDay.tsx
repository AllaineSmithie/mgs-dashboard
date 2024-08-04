/*************************************************************************/
/*  SessionStartedPerDay.tsx                                             */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Card from '@webapps-common/UI/Card'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export default function SessionStartedPerDay() {
  const data = [
    {
      date: '05/02',
      count: 400,
    },
    {
      date: '06/02',
      count: 3000,
    },
    {
      date: '07/02',
      count: 2000,
    },
    {
      date: '08/02',
      count: 2780,
    },
    {
      date: '09/02',
      count: 1890,
    },
    {
      date: '10/02',
      count: 2390,
    },
    {
      date: '11/02',
      count: 3490,
    },
  ]
  return (
    <Card>
      <Card.Body>
        <Card.Title>Sessions started daily</Card.Title>
        <ResponsiveContainer height={250} width="100%">
          <AreaChart
            data={data}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              style={{ fontSize: '0.8rem' }}
            />
            <YAxis
              width={40}
              style={{ fontSize: '0.8rem' }}
            />
            <Tooltip />
            <Area type="monotone" dataKey="count" name="Sessions" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  )
}
