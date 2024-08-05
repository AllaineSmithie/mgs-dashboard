/*************************************************************************/
/*  overview.tsx                                                         */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import ProgressBar from '@webapps-common/UI/ProgressBar'
import Card from '@webapps-common/UI/Card'
import {
  Label,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import React, { useEffect, useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Payload } from 'recharts/types/component/DefaultLegendContent'
import withSchema from 'src/utils/withSchema'
import MainLayout from '@components/MainLayout'

export default function MultiplayerOverview() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Multiplayer' }],
        breadcrumbCurrentText: 'Overview',
      }}
    >
      <MultiplayerOverviewContent />
    </MainLayout>
  )
}

function MultiplayerOverviewContent() {
  const supabase = useSupabaseClient()

  const [data, setData] = useState(defaultData)

  const fetchData = useCallback(async () => {
    // List all requests
    const playerCountRequests = [
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: null,
        is_in_game: null,
        is_created_by_matchmaker: null,
        is_private: null,
        is_webrtc: null,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: null,
        is_in_game: false,
        is_created_by_matchmaker: null,
        is_private: null,
        is_webrtc: null,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: null,
        is_in_game: true,
        is_created_by_matchmaker: null,
        is_private: null,
        is_webrtc: null,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: true,
        is_in_game: true,
        is_created_by_matchmaker: true,
        is_private: null,
        is_webrtc: null,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: false,
        is_in_game: null,
        is_created_by_matchmaker: null,
        is_private: null,
        is_webrtc: null,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: true,
        is_in_game: true,
        is_created_by_matchmaker: true,
        is_private: null,
        is_webrtc: true,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: true,
        is_in_game: true,
        is_created_by_matchmaker: true,
        is_private: null,
        is_webrtc: false,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: true,
        is_in_game: true,
        is_created_by_matchmaker: false,
        is_private: null,
        is_webrtc: null,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: true,
        is_in_game: true,
        is_created_by_matchmaker: false,
        is_private: true,
        is_webrtc: null,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: true,
        is_in_game: true,
        is_created_by_matchmaker: false,
        is_private: null,
        is_webrtc: true,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: true,
        is_in_game: true,
        is_created_by_matchmaker: false,
        is_private: null,
        is_webrtc: false,
      }),
      withSchema(supabase, 'w4online').rpc('players_count', {
        is_in_lobby: true,
        is_in_game: true,
        is_created_by_matchmaker: false,
        is_private: null,
        is_webrtc: false,
      }),
    ]
    const playerCountPerMatchmakingProfileRequest = withSchema(
      supabase,
      'w4online',
    ).rpc('players_count_per_matchmaker_profile')
    const fleetsRequest = withSchema(supabase, 'w4online').rpc(
      'fleet_get_all',
    )

    // Execute all requests
    const requests = playerCountRequests.concat([
      playerCountPerMatchmakingProfileRequest,
      fleetsRequest,
    ])
    const results = await Promise.all(requests)

    // Process the player counts results
    const playerCountResults = results.slice(0, playerCountRequests.length)
    const out = { ...defaultData }
    const propsNames = [
      'player_count',
      'lobbies_count',
      'players_notingame',
      'lobbies_notingame',
      'players_ingame',
      'lobbies_ingame',
      'players_ingame_matchmaker',
      'lobbies_ingame_matchmaker',
      'players_matchmaker_w4lobby',
      'lobbies_matchmaker_w4lobby', // Always 0
      'players_ingame_matchmaker_p2p',
      'lobbies_ingame_matchmaker_p2p',
      'players_ingame_matchmaker_hosted',
      'lobbies_ingame_matchmaker_hosted',
      'players_ingame_usercreated',
      'lobbies_ingame_usercreated',
      'players_ingame_usercreated_private',
      'lobbies_ingame_usercreated_private',
      'players_ingame_usercreated_p2p',
      'lobbies_ingame_usercreated_p2p',
      'players_ingame_usercreated_hosted',
      'lobbies_ingame_usercreated_hosted',
      'players_ingame_hosted',
      'lobbies_ingame_hosted',
    ] as (keyof typeof out)[]

    playerCountResults.forEach((res, index) => {
      if (res.error) {
        toast.error(`Request failed: ${res.error?.message}`)
      } else {
        out[propsNames[index * 2]] = res.data.players
        out[propsNames[index * 2 + 1]] = res.data.lobbies
      }
    })

    // Process the player counts per matchmaker profile
    const playerCountPerMatchmakingProfileRes = results[playerCountRequests.length]
    if (playerCountPerMatchmakingProfileRes.error) {
      toast.error(
        `Request failed: ${playerCountPerMatchmakingProfileRes.error?.message}`,
      )
    } else {
      out.players_ingame_per_matchmaking_profile = playerCountPerMatchmakingProfileRes.data
    }

    const fleetRes = results[playerCountRequests.length + 1]
    if (fleetRes.error) {
      toast.error(`Request failed: ${fleetRes.error?.message}`)
    } else {
      out.fleets = fleetRes.data
    }

    setData(out)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // For the graph
  const allocatedGameservers = data.fleets
    .map((fleet) => fleet.in_use)
    .reduce((a, b) => a + b, 0)
  const readyGameservers = data.fleets
    .map((fleet) => fleet.nb_replicas)
    .reduce((a, b) => a + b, 0)
  const maxGameservers = data.fleets
    .map((fleet) => fleet.max_replicas)
    .reduce((a, b) => a + b, 0)

  return (
    <div className="tw-flex tw-flex-col tw-gap-3">
      <Card>
        <Card.Header>Players</Card.Header>
        <Card.Body>
          <div>
            <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Total"
                  color={0}
                  value={data.player_count}
                />
              </div>
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Not in games"
                  color={0}
                  values={[data.players_notingame, data.lobbies_notingame]}
                  labels={['players', 'lobbies']}
                />
              </div>
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="In games"
                  color={0}
                  values={[data.players_ingame, data.lobbies_ingame]}
                  labels={['players', 'lobbies']}
                />
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      <Card>
        <Card.Header>Matchmaker</Card.Header>
        <Card.Body>
          <div>
            <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Games created by the matchmaker"
                  color={0}
                  values={[
                    data.players_ingame_matchmaker,
                    data.lobbies_ingame_matchmaker,
                  ]}
                  labels={['players', 'lobbies']}
                />
              </div>
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Players waiting to get a lobby"
                  color={1}
                  value={data.players_matchmaker_w4lobby}
                />
              </div>
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Peer-to-peer games"
                  color={2}
                  values={[
                    data.players_ingame_matchmaker_p2p,
                    data.lobbies_ingame_matchmaker_p2p,
                  ]}
                  labels={['players', 'lobbies']}
                />
              </div>
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Games on a hosted game server"
                  color={3}
                  values={[
                    data.players_ingame_matchmaker_hosted,
                    data.lobbies_ingame_matchmaker_hosted,
                  ]}
                  labels={['players', 'lobbies']}
                />
              </div>
            </div>
            <div className="tw-flex tw-flex-col tw-justify-center tw-gap-4">
              <h6>Players per matchmaker profile</h6>
              <PerMatchmakingProfilePlayerCountWidget
                values={data.players_ingame_per_matchmaking_profile}
              />
            </div>
          </div>
        </Card.Body>
      </Card>
      <Card>
        <Card.Header>Created by users</Card.Header>
        <Card.Body>
          <div>
            <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="In games created by users"
                  color={0}
                  values={[
                    data.players_ingame_usercreated,
                    data.lobbies_ingame_usercreated,
                  ]}
                  labels={['players', 'lobbies']}
                />
              </div>
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Private games"
                  color={1}
                  values={[
                    data.players_ingame_usercreated_private,
                    data.lobbies_ingame_usercreated_private,
                  ]}
                  labels={['players', 'lobbies']}
                />
              </div>
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Peer-to-peer games"
                  color={2}
                  values={[
                    data.players_ingame_usercreated_p2p,
                    data.lobbies_ingame_usercreated_p2p,
                  ]}
                  labels={['players', 'lobbies']}
                />
              </div>
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Games on a hosted game server"
                  color={3}
                  values={[
                    data.players_ingame_usercreated_hosted,
                    data.lobbies_ingame_usercreated_hosted,
                  ]}
                  labels={['players', 'lobbies']}
                />
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      <Card className="tw-mb4">
        <Card.Header>Game servers</Card.Header>
        <Card.Body>
          <div>
            <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Game servers running"
                  color={3}
                  value={readyGameservers}
                />
              </div>
              <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
                <ValueWidget
                  title="Players on hosted game servers"
                  color={3}
                  values={[
                    data.players_ingame_hosted,
                    data.lobbies_ingame_hosted,
                  ]}
                  labels={['players', 'lobbies']}
                />
              </div>
            </div>
            <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
              <div className="tw-flex tw-flex-col tw-justify-center tw-gap-4 tw-w-5/12">
                <h6>Overall occupancy</h6>
                <OverallOccupancy
                  allocated={allocatedGameservers}
                  ready={readyGameservers}
                  max={maxGameservers}
                />
              </div>
              <div className="tw-flex tw-flex-col  tw-flex-1 tw-align-center tw-gap-4 tw-w-7/12">
                <h6>Occupancy per fleet</h6>
                <PerFleetOccupancy fleets={data.fleets} />
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

type Fleet = {
  name: number;
  in_use: number;
  nb_replicas: number;
  max_replicas: number;
}

// Label for the circular graph
type MultiLineCenteredLabelProps = {
  viewBox?: {
    cx: number;
    cy: number;
  };
  lines: string[];
}
function MultiLineCenteredLabel({
  viewBox,
  lines,
}: MultiLineCenteredLabelProps) {
  const spans = lines.map((element, index) => {
    if (index === 0) {
      return (
        <tspan
          key={index.toString() + element}
          x={viewBox?.cx}
          dy={`-${String((lines.length - 1) * 1.5)}em`}
        >
          {element}
        </tspan>
      )
    }
    return (
      <tspan key={index.toString() + element} x={viewBox?.cx} dy="1.3em">
        {element}
      </tspan>
    )
  })

  return (
    <text
      style={{ fontSize: '14px', fontWeight: 'bold', fill: '#777' }}
      offset="5"
      x={viewBox?.cx}
      y={viewBox?.cy}
      dy="0"
      fill="#808080"
      className="recharts-text recharts-label"
      textAnchor="middle"
    >
      {spans}
    </text>
  )
}

// Widget to display one or multiple values with a colored border on the left.
type ValueWidgetProps = {
  title: string;
  color: number;
  value?: string | number;
  values?: (string | number | null)[];
  labels?: string[];
}
function ValueWidget({
  title,
  color,
  value,
  values = [],
  labels = [],
}: ValueWidgetProps) {
  const colorClasses = [
    'tw-border-teal-500', // info
    'tw-border-success-500', // success
    'tw-border-orange-500', // warning
    'tw-border-danger-500', // danger
  ]

  let valuesCleaned = values
  if (value !== undefined) {
    valuesCleaned = ([value] as typeof values).concat(valuesCleaned)
  }
  valuesCleaned = valuesCleaned.map((v) => (v === null ? 'N/A' : v))
  const labelsCleaned = labels === undefined ? [] : labels
  return (
    <div className={`tw-border-l-4 tw-px-3 tw-mb-3 ${colorClasses[color]}`}>
      <small>{title}</small>
      <div style={{ paddingLeft: 0 }}>
        <div className="tw-flex tw-flex-1 tw-align-center tw-gap-4">
          {valuesCleaned.map((valueCleaned, index) => {
            if (index < labelsCleaned.length) {
              return (
                <div key={index.toString() + valueCleaned}>
                  <span className="tw-text-xl tw-font-semibold">{valueCleaned}</span>
                  {' '}
                  <span>{labelsCleaned[index]}</span>
                </div>
              )
            }
            return (
              <div className="tw-flex tw-justify-center tw-gap-4" key={index.toString() + valueCleaned}>
                <span className="tw-text-xl tw-font-semibold">{valueCleaned}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

type PerMatchmakingProfilePlayerCountWidgetProps = {
  values: {
    id: string;
    name: string;
    playerCount: number;
  }[];
}
function PerMatchmakingProfilePlayerCountWidget({
  values,
}: PerMatchmakingProfilePlayerCountWidgetProps) {
  const max = values.map((v) => v.playerCount).reduce((a, b) => a + b, 0)
  if (values.length === 0) {
    return (
      <Card>
        <Card.Body className="tw-text-center">
          No players in games created by an existing matchmaking profile
        </Card.Body>
      </Card>
    )
  }
  return (
    <div>
      {values.map((value) => (
        <div className="tw-flex tw-justify-center tw-gap-4" key={value.id}>
          <div className="tw-flex-1 tw-self-end">{value.name}</div>
          <div className="tw-w-10/12">
            <span>{value.playerCount}</span>
            <ProgressBar now={value.playerCount} max={max} />
          </div>
        </div>
      ))}
    </div>
  )
}

type OverallOccupancyProps = {
  allocated: number;
  ready: number;
  max: number;
}
function OverallOccupancy({ allocated, ready, max }: OverallOccupancyProps) {
  if (max === 0) {
    return (
      <Card>
        <Card.Body className="tw-text-center">No configured fleet</Card.Body>
      </Card>
    )
  }
  // For the graph
  const graphData = [
    {
      name: 'Allocated',
      count: allocated,
    },
    {
      name: 'Ready',
      count: ready - allocated,
    },
    {
      name: 'Remaining capacity',
      count: max - ready,
    },
  ]
  const allocatedCount = graphData[0].count
  const totalCount = graphData[0].count + graphData[1].count + graphData[2].count
  const colors = ['#4E9F3D', '#4F98CA', '#808080']

  const graphDiameter = 200

  return (
    <ResponsiveContainer height={graphDiameter * 0.8} width="80%">
      <PieChart>
        <Pie
          data={graphData}
          startAngle={180}
          endAngle={0}
          cx="50%"
          cy="80%"
          innerRadius={graphDiameter * 0.4}
          outerRadius={graphDiameter * 0.5}
          paddingAngle={1}
          dataKey="count"
          legendType="none"
        >
          {graphData.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={colors[index]} stroke="" />
          ))}

          <Label
            content={(
              <MultiLineCenteredLabel
                lines={['Game servers:', `${allocatedCount} / ${totalCount}`]}
              />
            )}
          />
        </Pie>
        <Legend
          align="right"
          verticalAlign="middle"
          layout="vertical"
          payload={graphData
            .map(
              (item, index) => ({
                id: item.name,
                type: 'square',
                value: `${item.name}`,
                color: colors[index % colors.length],
              } as Payload),
            )
            .filter((_item, index) => index < graphData.length - 1)}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

type PerFleetOccupancyProps = {
  fleets: Fleet[];
}
function PerFleetOccupancy({
  fleets,
}: PerFleetOccupancyProps) {
  if (fleets.length === 0) {
    return (
      <Card>
        <Card.Body className="tw-text-center">No configured fleet</Card.Body>
      </Card>
    )
  }
  return (
    <div>
      {fleets.map((fleet) => (
        <div className="tw-flex tw-justify-center tw-gap-4" key={fleet.name}>
          <div className="tw-flex-1 tw-self-end">{fleet.name}</div>
          <div className="tw-w-10/12">
            <span>
              {fleet.in_use}
              {' '}
              /
              {fleet.max_replicas}
              {' '}
              (
              {(fleet.in_use * 100) / fleet.max_replicas}
              {' '}
              %)
            </span>
            <ProgressBar
              now={fleet.in_use}
              max={fleet.max_replicas}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const defaultData = {
  // Players
  player_count: 0,
  lobbies_count: 0,
  players_notingame: 0,
  lobbies_notingame: 0,
  players_ingame: 0, //
  lobbies_ingame: 0, //

  // Matchmaker
  players_ingame_matchmaker: 0, //
  lobbies_ingame_matchmaker: 0, //
  players_matchmaker_w4lobby: 0,
  lobbies_matchmaker_w4lobby: 0, // Always 0
  players_ingame_matchmaker_p2p: 0, //
  lobbies_ingame_matchmaker_p2p: 0, //
  players_ingame_matchmaker_hosted: 0, //
  lobbies_ingame_matchmaker_hosted: 0, //
  players_ingame_per_matchmaking_profile: [],

  // Created by user
  players_ingame_usercreated: 0, //
  lobbies_ingame_usercreated: 0, //
  players_ingame_usercreated_private: 0, //
  lobbies_ingame_usercreated_private: 0, //
  players_ingame_usercreated_p2p: 0, //
  lobbies_ingame_usercreated_p2p: 0, //
  players_ingame_usercreated_hosted: 0, //
  lobbies_ingame_usercreated_hosted: 0, //

  // Game servers
  gameservers: 0, // TODO
  fleets: [] as Fleet[],
  players_ingame_hosted: 0,
  lobbies_ingame_hosted: 0,
}
