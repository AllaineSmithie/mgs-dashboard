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
  faBarcode,
  faChevronRight,
  faTable,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import {
  PropsWithChildren, useCallback, useEffect,
} from 'react'
import withSchema from '@services/withSchema'
import { toast } from 'react-toastify'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
// import cn from '@webapps-common/utils/classNamesMerge'
// import { useRuntimeEnvVars } from '@webapps-common/utils/runtimeEnvVarsEndpoint'
export default function Lobbies() {
  // const [userCount, setUserCount] = useState<number | undefined>(undefined)
  // const [gameserverCount, setGameserverCount] = useState<number | undefined>(undefined)

  // const envVars = useRuntimeEnvVars()

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
      // return
    }
    // setUserCount(res.data.players)
  }, [supabase])

  const fetchGameserverCountCount = useCallback(async () => {
    const res = await withSchema(supabase, 'w4online').rpc('fleet_get_all')
    if (res.error) {
      toast.error(`Request failed: ${res.error?.message}`)
      // return
    }

    // const readyGameservers = (res.data as Fleet[])
    //  .map((fleet) => fleet.nb_replicas)
    //  .reduce((a, b) => a + b, 0)
    // setGameserverCount(readyGameservers)
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
      <div className="tw-flex tw-flex-col tw-gap-3 tw-h-full">
        <div className="tw-prose dark:tw-prose-invert">
          <h2>Welcome to your dashboard</h2>
        </div>

        <div>
          <h3 className="tw-text-xl tw-mt-7">Inventory and Events</h3>
        </div>
        <div className="tw-grid md:tw-grid-cols-3 tw-gap-3 tw-justify-items-stretch">
          <LinkCard
            title="Products"
            icon={faBarcode}
            href="/products/"
          >
            Manage products.
          </LinkCard>
          <LinkCard
            title="Events"
            icon={faTable}
            href="/events/"
          >
            Manage Events.
          </LinkCard>
          <LinkCard
            title="Customers"
            icon={faUsers}
            href="/users/"
          >
            Manage customers.
          </LinkCard>
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
