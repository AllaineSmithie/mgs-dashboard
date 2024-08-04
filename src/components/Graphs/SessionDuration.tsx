/*************************************************************************/
/*  SessionDuration.tsx                                                  */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Card from '@webapps-common/UI/Card'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export default function SessionStartedPerDay() {
  const data = [
    {
      duration: '0 to 5 min',
      count: 15,
    },
    {
      duration: '5 to 15 min',
      count: 30,
    },
    {
      duration: '15 to 30 min',
      count: 87,
    },
    {
      duration: '30 min to 1h',
      count: 350,
    },
    {
      duration: '1h to 2h',
      count: 180,
    },
    {
      duration: 'More than 2h',
      count: 90,
    },
  ]
  return (
    <Card>
      <Card.Body>
        <Card.Title>Sessions duration</Card.Title>
        <ResponsiveContainer height={250} width="100%">
          <BarChart
            data={data}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="duration"
              style={{ fontSize: '0.8rem' }}
            />
            <YAxis
              style={{ fontSize: '0.8rem' }}
            />
            <Tooltip />
            <Bar dataKey="count" name="Sessions" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  )
}
