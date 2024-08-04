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
      if (autoRedirectToHomeIfAlreadyLoggedIn) {
        setIsLoading(true)

        // Check if the user is connected.
        const { data } = await supabase.auth.getSession()
        if (!data?.session?.user) {
          setIsLoading(false)
          return
        }

        // Check if they have the highest authentication level.
        const res = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (res.error) {
          setIsLoading(false)
          return
        }
        if (res.data.nextLevel === 'aal2' && res.data.nextLevel !== res.data.currentLevel) {
          setIsLoading(false)
          return
        }

        router.push(homeHref)
      }
    }
    autoRedirect()
  }, [])
  if (isLoading) {
    return <LoadingPage />
  }
  return children as JSX.Element
}
