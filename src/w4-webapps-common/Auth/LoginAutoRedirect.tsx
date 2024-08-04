/*************************************************************************/
/*  LoginAutoRedirect.tsx                                                */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  AuthChangeEvent, Session, Subscription, User,
} from '@supabase/gotrue-js'
import { useRouter } from 'next/router'
import {
  PropsWithChildren, ReactNode, useCallback, useEffect, useState,
} from 'react'
import UnauthorizedPage from '../UI/UnauthorizedPage'

export type LoginAutoRedirectProps = {
  fallback?: JSX.Element;
  isAuthorized?: (user: User) => boolean;
  unauthorizedPage?: ReactNode;
  loginPageHref: string;
  mfaPageHref?: string;
} & PropsWithChildren
export function LoginAutoRedirect({
  fallback,
  isAuthorized = () => true,
  unauthorizedPage = <UnauthorizedPage />,
  loginPageHref,
  mfaPageHref,
  children,
}: LoginAutoRedirectProps) {
  const router = useRouter()
  const supabase = useSupabaseClient()

  const [subscription, setSubscription] = useState<Subscription>()

  const [authorized, setAuthorized] = useState(false)
  const [logged, setLogged] = useState(false)
  const [hasHighestAssuranceLevel, setHasHighestAssuranceLevel] = useState(false)

  const checkAuthorized = useCallback(async (event: AuthChangeEvent, session: Session | null) => {
    const acceptedEvents = ['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED']
    if (!acceptedEvents.includes(event)) {
      return
    }

    // Check if we are logged in.
    if (!session) {
      router.push(loginPageHref)
      setLogged(false)
      return
    }
    setLogged(true)

    // Check if we have the required roles to use the app.
    if (!session.user || !isAuthorized(session.user)) {
      setAuthorized(false)
      return
    }
    setAuthorized(true)

    // Check if we have 2FA enabled, and that we need to increase our assurance level.
    const res = supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    res.then((response) => {
      const { data, error } = response
      if (error) {
        return
      }
      if (data.nextLevel === 'aal2' && data.nextLevel !== data.currentLevel) {
        if (mfaPageHref) {
          router.push(mfaPageHref)
        }
        setHasHighestAssuranceLevel(false)
        return
      }
      setHasHighestAssuranceLevel(true)
    })
  }, [isAuthorized, loginPageHref, mfaPageHref, router, supabase.auth.mfa])

  useEffect(() => {
    if (subscription) {
      subscription.unsubscribe()
    }
    const { data } = supabase.auth.onAuthStateChange(checkAuthorized)
    setSubscription(data.subscription)
  }, [])

  if (logged && hasHighestAssuranceLevel) {
    if (!authorized) {
      return unauthorizedPage
    }
    return children as JSX.Element
  }
  return fallback as JSX.Element
}
