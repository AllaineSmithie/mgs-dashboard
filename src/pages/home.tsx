/*************************************************************************/
/*  home.tsx                                                             */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Link from 'next/link'
import Card from '@webapps-common/UI/Card'
import MainLayout from '@components/MainLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  IconDefinition,
  faBookOpen,
  faChevronRight,
  faCog,
  faDownload, faList, faPeopleArrows, faServer, faTable, faUsers, faWarehouse,
} from '@fortawesome/free-solid-svg-icons'
import Button from '@webapps-common/UI/Button'
import {
  PropsWithChildren, ReactElement, useCallback, useEffect, useState,
} from 'react'
import withSchema from '@services/withSchema'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import cn from '@webapps-common/utils/classNamesMerge'
import { useRuntimeEnvVars } from '@webapps-common/utils/runtimeEnvVarsEndpoint'

type Fleet = {
  name: number;
  in_use: number;
  nb_replicas: number;
  max_replicas: number;
}

export default function Lobbies() {
  const [userCount, setUserCount] = useState<number | undefined>(undefined)
  const [gameserverCount, setGameserverCount] = useState<number | undefined>(undefined)

  const envVars = useRuntimeEnvVars()

  const supabase = useSupabaseClient()

  const fetchUserCount = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online').rpc('players_count', {
      is_in_lobby: null,
      is_in_game: null,
      is_created_by_matchmaker: null,
      is_private: null,
      lobby_types: null,
    })
    if (res.error) {
      toast.error(`Request failed: ${res.error?.message}`)
      return
    }
    setUserCount(res.data.players)
  }, [supabase])

  const fetchGameserverCountCount = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online').rpc('fleet_get_all')
    if (res.error) {
      toast.error(`Request failed: ${res.error?.message}`)
      return
    }

    const readyGameservers = (res.data as Fleet[])
      .map((fleet) => fleet.nb_replicas)
      .reduce((a, b) => a + b, 0)
    setGameserverCount(readyGameservers)
  }, [supabase])

  useEffect(() => {
    fetchUserCount()
    fetchGameserverCountCount()
  }, [fetchUserCount, fetchGameserverCountCount])

  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'Home',
      }}
    >
      <div className="flex flex-col gap-3 h-full">
        <div className="prose dark:prose-invert">
          <h2>Welcome to your dashboard</h2>
        </div>

        <div>
          <h3 className="text-xl mt-7">Players and data</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-3 justify-items-stretch">
          <LinkCard
            title="Users"
            icon={faUsers}
            href="/users/"
          >
            Manage users.
          </LinkCard>
          <LinkCard
            title="Database"
            icon={faTable}
            href="/data/database/tables"
          >
            Manage tables and rows.
          </LinkCard>
          <LinkCard
            title="Storage"
            icon={faWarehouse}
            href="/data/storage/buckets/"
          >
            Upload and manage files.
          </LinkCard>
        </div>
        <div>
          <h3 className="text-xl mt-7">Multiplayer</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid grid-cols-4 gap-3">
            <NumberCard count={userCount} text="Users in lobbies" zeroCountText="No user in lobbies" />
            <Card className="col-span-3">
              <Card.Body className="flex gap-3 h-full">
                <div>
                  <div className="min-w-[3rem] min-h-[3rem] flex items-center justify-center">
                    <FontAwesomeIcon icon={faPeopleArrows} className="h-[2rem] w-[2rem]" />
                  </div>
                </div>
                <div className="grow">
                  <div className="font-bold">Matchmaking</div>
                  Group your users together and bring them into a game.
                  <div className="flex gap-2 mt-3">
                    <Link href="/multiplayer/lobbies/">
                      <Button className="px-2 py-1">
                        <FontAwesomeIcon icon={faList} />
                        Lobbies list
                      </Button>
                    </Link>
                    <Link href="/multiplayer/fleets/">
                      <Button className="px-2 py-1">
                        <FontAwesomeIcon icon={faCog} />
                        Configure
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <NumberCard count={gameserverCount} text="Active game servers" zeroCountText="No active game server" className="dark:bg-teal-800 bg-teal-700" />
            <Card className="col-span-3">
              <Card.Body className="flex gap-3 h-full">
                <div>
                  <div className="min-w-[3rem] min-h-[3rem] flex items-center justify-center">
                    <FontAwesomeIcon icon={faServer} className="h-[2rem] w-[2rem]" />
                  </div>
                </div>
                <div className="grow flex flex-col">
                  <div className="font-bold">Game servers</div>
                  <div className="grow">Run your game servers on the W4Cloud infrastructure.</div>
                  <div className="flex gap-2 mt-3">
                    <Link href="/multiplayer/servers/">
                      <Button className="px-2 py-1">
                        <FontAwesomeIcon icon={faList} />
                        Game servers list
                      </Button>
                    </Link>
                    <Link href="/multiplayer/matchmaker/">
                      <Button className="px-2 py-1">
                        <FontAwesomeIcon icon={faCog} />
                        Configure
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="text-xl mt-7">Getting started</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <LinkCard
            title="Documentation"
            icon={faBookOpen}
            href={envVars?.env.RUNTIME_PUBLIC_API_DOCS_URL || ''}
          >
            The documentation for our workspace API and our Godot SDK.
          </LinkCard>
          <Card>
            <Card.Body className="flex items-center gap-5">
              <div className="grow">
                <Card.Title>GDscript SDK</Card.Title>
                <div className="mt-2">
                  Setup you project for the W4Could services.
                </div>
              </div>
              <div>
                <a href="https://gitlab.com/W4Games/sdk/w4gd/-/releases" target="_blank" rel="noopener noreferrer">
                  <Button className="p-3">
                    Download
                    {' '}
                    <FontAwesomeIcon icon={faDownload} />
                  </Button>
                </a>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

type LinkCardProps = {
  icon: IconDefinition;
  title: string;
  href: string;
} & PropsWithChildren
function LinkCard({
  icon,
  title,
  href,
  children,
} : LinkCardProps) {
  return (
    <Link href={href} className="no-underline text-foreground">
      <Card className="flex flex-col">
        <Card.Body className="grow flex gap-5 hover:bg-surface-200 items-center transition-all">
          <div>
            <div className="min-w-[3rem] min-h-[3rem] flex items-center justify-center">
              <FontAwesomeIcon icon={icon} className="h-[2rem] w-[2rem]" />
            </div>
          </div>
          <div className="grow">
            <Card.Title>{title}</Card.Title>
            <div className="mt-2">
              {children}
            </div>
          </div>
          <div className="place-self-start">
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </Card.Body>
      </Card>
    </Link>
  )
}

type NumberCardProps = {
  count?: number;
  text: string;
  zeroCountText?: string;
  className?: string;
}
function NumberCard({
  count,
  text,
  zeroCountText,
  className,
} : NumberCardProps) {
  let content : ReactElement | null
  if (count == null) {
    content = null
  } else if (!zeroCountText || count > 0) {
    content = (
      <>
        <div className="text-6xl">
          {count}
        </div>
        <div className="text-sm grow text-center uppercase">
          {text}
        </div>
      </>
    )
  } else {
    content = (
      <div className="text-sm grow text-center uppercase flex flex-col place-content-center">
        {zeroCountText}
      </div>
    )
  }

  return (
    <Card className={cn('basis-1/3 dark:bg-yellow-800 bg-yellow-700 text-white border-0', className)}>
      <Card.Body className="flex flex-col h-full items-center gap-3">
        {content}
      </Card.Body>
    </Card>
  )
}
