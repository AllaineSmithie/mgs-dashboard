/*************************************************************************/
/*  HomeAutoRedirect.tsx                                                 */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { PropsWithChildren, useEffect, useState } from 'react'
import LoadingPage from '../UI/LoadingPage'

export type HomeAutoRedirectProps = {
  autoRedirectToHomeIfAlreadyLoggedIn?: boolean;
  homeHref: string;
} & PropsWithChildren

export default function HomeAutoRedirect({
  autoRedirectToHomeIfAlreadyLoggedIn = true,
  homeHref,
  children,
}: HomeAutoRedirectProps) {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  // Auto-redirect to the home page if the user is already logged in
  useEffect(() => {
    async function autoRedirect() {
      const { data } = await supabase.auth.getSession()
      setIsLoading(false)
      if (autoRedirectToHomeIfAlreadyLoggedIn && data?.session?.user) {
        router.push(homeHref)
      }
    }
    autoRedirect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (isLoading) {
    return <LoadingPage />
  }
  return children as JSX.Element
}
