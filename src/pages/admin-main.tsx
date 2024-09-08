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
  faDownload, faList, faMicrochip, faMobileScreenButton, faPeopleArrows, faServer, faTable, faUsers, faWarehouse,
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
      is_webrtc: null,
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
        breadcrumbCurrentText: 'Admin Main',
      }}
    >
      <div className="tw-flex tw-flex-col tw-gap-3 tw-h-full">
        <div className="tw-prose dark:tw-prose-invert">
          <h2>Admin Main Page</h2>
        </div>

        <div>
          <h3 className="tw-text-xl tw-mt-7">Players and data</h3>
        </div>
        <div className="tw-grid md:tw-grid-cols-3 tw-gap-3 tw-justify-items-stretch">
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
            href="/data/database/"
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
          <h3 className="tw-text-xl tw-mt-7">Deployment</h3>
        </div>
        <div className="tw-grid md:tw-grid-cols-2 tw-gap-3 tw-justify-items-stretch">
          <LinkCard
            title="Apps"
            icon={faMobileScreenButton}
            href="/apps/"
          >
            Manage apps.
          </LinkCard>
          <LinkCard
            title="Devices"
            icon={faMicrochip}
            href="/devices/"
          >
            Manage devices.
          </LinkCard>
        </div>
        <div>
          <h3 className="tw-text-xl tw-mt-7">Multiplayer</h3>
        </div>
        <div className="tw-grid md:tw-grid-cols-2 tw-gap-3">
          <div className="tw-grid tw-grid-cols-4 tw-gap-3">
            <NumberCard count={userCount} text="Users in lobbies" zeroCountText="No user in lobbies" />
            <Card className="tw-col-span-3">
              <Card.Body className="tw-flex tw-gap-3 tw-h-full">
                <div>
                  <div className="tw-min-w-[3rem] tw-min-h-[3rem] tw-flex tw-items-center tw-justify-center">
                    <FontAwesomeIcon icon={faPeopleArrows} className="tw-h-[2rem] tw-w-[2rem]" />
                  </div>
                </div>
                <div className="tw-grow">
                  <div className="tw-font-bold">Matchmaking</div>
                  Group your users together and bring them into a game.
                  <div className="tw-flex tw-gap-2 tw-mt-3">
                    <Link href="/multiplayer/lobbies/">
                      <Button className="tw-px-2 tw-py-1">
                        <FontAwesomeIcon icon={faList} />
                        Lobbies list
                      </Button>
                    </Link>
                    <Link href="/multiplayer/fleets/">
                      <Button className="tw-px-2 tw-py-1">
                        <FontAwesomeIcon icon={faCog} />
                        Configure
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
          <div className="tw-grid tw-grid-cols-4 tw-gap-3">
            <NumberCard count={gameserverCount} text="Active game servers" zeroCountText="No active game server" className="dark:tw-bg-teal-800 tw-bg-teal-700" />
            <Card className="tw-col-span-3">
              <Card.Body className="tw-flex tw-gap-3 tw-h-full">
                <div>
                  <div className="tw-min-w-[3rem] tw-min-h-[3rem] tw-flex tw-items-center tw-justify-center">
                    <FontAwesomeIcon icon={faServer} className="tw-h-[2rem] tw-w-[2rem]" />
                  </div>
                </div>
                <div className="tw-grow tw-flex tw-flex-col">
                  <div className="tw-font-bold">Game servers</div>
                  <div className="tw-grow">Run your game servers on the Metro Gaya Cloud infrastructure.</div>
                  <div className="tw-flex tw-gap-2 tw-mt-3">
                    <Link href="/multiplayer/servers/">
                      <Button className="tw-px-2 tw-py-1">
                        <FontAwesomeIcon icon={faList} />
                        Game servers list
                      </Button>
                    </Link>
                    <Link href="/multiplayer/matchmaker/">
                      <Button className="tw-px-2 tw-py-1">
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
          <h3 className="tw-text-xl tw-mt-7">Getting started</h3>
        </div>
        <div className="tw-grid md:tw-grid-cols-2 tw-gap-3">
          <LinkCard
            title="Documentation"
            icon={faBookOpen}
            href={envVars?.env.RUNTIME_PUBLIC_API_DOCS_URL || ''}
          >
            The documentation for our workspace API and the Metro Gaya SDK.
          </LinkCard>
          <Card>
            <Card.Body className="tw-flex tw-items-center tw-gap-5">
              <div className="tw-grow">
                <Card.Title>GDscript SDK</Card.Title>
                <div className="tw-mt-2">
                  Setup you project for the W4Could services.
                </div>
              </div>
              <div>
                <a href="https://gitlab.com/W4Games/sdk/w4gd/-/releases" target="_blank" rel="noopener noreferrer">
                  <Button className="tw-p-3">
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
    <Link href={href} className="tw-no-underline tw-text-foreground">
      <Card className="tw-flex tw-flex-col">
        <Card.Body className="tw-grow tw-flex tw-gap-5 hover:tw-bg-surface-200 tw-items-center tw-transition-all">
          <div>
            <div className="tw-min-w-[3rem] tw-min-h-[3rem] tw-flex tw-items-center tw-justify-center">
              <FontAwesomeIcon icon={icon} className="tw-h-[2rem] tw-w-[2rem]" />
            </div>
          </div>
          <div className="tw-grow">
            <Card.Title>{title}</Card.Title>
            <div className="tw-mt-2">
              {children}
            </div>
          </div>
          <div className="tw-place-self-start">
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
        <div className="tw-text-6xl">
          {count}
        </div>
        <div className="tw-text-sm tw-grow tw-text-center tw-uppercase">
          {text}
        </div>
      </>
    )
  } else {
    content = (
      <div className="tw-text-sm tw-grow tw-text-center tw-uppercase tw-flex tw-flex-col tw-place-content-center">
        {zeroCountText}
      </div>
    )
  }

  return (
    <Card className={cn('tw-basis-1/3 dark:tw-bg-yellow-800 tw-bg-yellow-700 tw-text-white tw-border-0', className)}>
      <Card.Body className="tw-flex tw-flex-col tw-h-full tw-items-center tw-gap-3">
        {content}
      </Card.Body>
    </Card>
  )
}
