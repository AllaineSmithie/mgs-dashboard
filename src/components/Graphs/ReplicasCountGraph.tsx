/*************************************************************************/
/*  ReplicasCountGraph.tsx                                               */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import React, { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts'

type ReplicasCountGraphProps = {
  min: number;
  allocated: number;
  ready: number;
  max: number;
  buffer: number;
}

export default function ReplicasCountGraph({
  min, allocated, ready, max, buffer,
} : ReplicasCountGraphProps) {
  const [activeGraphSector, setActiveGraphSector] = useState(0)

  const graphDiameter = 200

  const readinessTarget = Math.max(min, Math.min(max, allocated + buffer))
  const occupencyRate = allocated / max
  let allocatedColor = '#4E9F3D'
  if (occupencyRate >= 0.8) {
    allocatedColor = '#850000'
  } else if (occupencyRate >= 0.5) {
    allocatedColor = '#C58940'
  }

  const data = []
  data.push({
    name: 'Allocated',
    value: allocated,
    isAbsolute: true,
    delta: 0,
    color: allocatedColor,
  })
  data.push({
    name: 'Ready',
    value: Math.min(ready, readinessTarget),
    isAbsolute: true,
    delta: 0,
    color: '#4F98CA',
  })

  if (readinessTarget > ready) {
    data.push({
      name: 'Starting',
      value: readinessTarget - ready,
      isAbsolute: false,
      delta: readinessTarget - ready,
      color: '#4F98CA',
      fill: 'url(#pattern-starting-servers)',
    })
  }
  if (readinessTarget < ready) {
    data.push({
      name: 'Stopping',
      value: ready - readinessTarget,
      isAbsolute: false,
      delta: ready - readinessTarget,
      color: '#9999BB',
      fill: 'url(#pattern-stopping-servers)',
    })
  }

  if (ready !== max) {
    data.push({
      name: 'Max allocation',
      value: max,
      isAbsolute: true,
      delta: 0,
      color: '#A2A2A2',
    })
  }

  let sum = 0
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].isAbsolute) {
      data[i].delta = data[i].value - sum
    }
    sum += data[i].delta
  }

  type RenderThresholdProps = {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    fill?: string;
    text: string;
  }
  const renderThreshold = ({
    cx, cy, midAngle, outerRadius, fill, text,
  } : RenderThresholdProps) => {
    const RADIAN = Math.PI / 180
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const sx = cx + (outerRadius) * cos
    const sy = cy + (outerRadius) * sin
    const mx = cx + (outerRadius + 30) * cos
    const my = cy + (outerRadius + 30) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 22
    const ey = my
    const textAnchor = cos >= 0 ? 'start' : 'end'
    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} strokeDasharray="2,2" strokeWidth={3} fill="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 5}
          y={ey}
          dy={6}
          textAnchor={textAnchor}
          fill={fill}
        >
          {text}
        </text>
      </g>
    )
  }

  type RenderActiveShapeProps = {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    payload: {
      color?: string;
      name: string;
      value: string;
      isAbsolute: boolean;
      fill?: string;
    };
  }
  const renderActiveShape = ({
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, payload,
  }: RenderActiveShapeProps) => {
    const activeStartAngle = payload.isAbsolute ? 180 : startAngle
    const fill = payload.fill ? payload.fill : payload.color

    return (
      <>
        <Sector
          key="1"
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        ,
        <Sector
          key="2"
          cx={cx}
          cy={cy}
          startAngle={activeStartAngle}
          endAngle={endAngle}
          innerRadius={innerRadius - 10}
          outerRadius={innerRadius - 3}
          fill={fill}
        />
        ,
        <text key="3" x={cx} y={cy + 20} dy={6} textAnchor="middle" fill={payload.color}>{`${payload.name}: ${payload.value}`}</text>
        ,
      </>
    )
  }

  const cy = graphDiameter * 0.8 - 20

  return (
    <PieChart width={graphDiameter * 2.5} height={graphDiameter}>
      <Pie
        activeIndex={activeGraphSector}
        activeShape={renderActiveShape}
        data={data}
        startAngle={180}
        endAngle={0}
        cy={cy}
        innerRadius={graphDiameter * 0.4}
        outerRadius={graphDiameter * 0.5}
        fill="#8884d8"
        paddingAngle={1}
        dataKey="delta"
        onMouseEnter={(_, index) => setActiveGraphSector(index)}
      >
        {
          data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.fill ? entry.fill : entry.color} stroke="" />
          ))
        }
      </Pie>
      {
          renderThreshold(
            {
              cx: graphDiameter * 1.25,
              cy,
              midAngle: 180 - (180 * min) / max,
              outerRadius: graphDiameter * 0.5,
              fill: '#A2A2A2',
              text: `Min ready: ${min}`,
            },
          )
        }
    </PieChart>
  )
}
