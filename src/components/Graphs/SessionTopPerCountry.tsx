/*************************************************************************/
/*  SessionTopPerCountry.tsx                                             */
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
      country: 'Argentina',
      count: 150,
    },
    {
      country: 'France',
      count: 81,
    },
    {
      country: 'Italy',
      count: 51,
    },
    {
      country: 'USA',
      count: 17,
    },
    {
      country: 'Germany',
      count: 13,
    },
  ]
  return (
    <Card>
      <Card.Body>
        <Card.Title>Top countries</Card.Title>
        <ResponsiveContainer height={250} width="100%">
          <BarChart
            layout="vertical"
            data={data}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              style={{ fontSize: '0.7rem' }}
            />
            <YAxis
              type="category"
              dataKey="country"
              style={{ fontSize: '0.7rem' }}
            />
            <Tooltip />
            <Bar dataKey="count" name="Sessions" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  )
}
