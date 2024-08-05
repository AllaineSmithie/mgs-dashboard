/*************************************************************************/
/*  LoginAutoRedirect.tsx                                                */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { User } from '@supabase/gotrue-js'
import { useRouter } from 'next/router'
import {
  PropsWithChildren, ReactNode, useEffect, useState,
} from 'react'
import UnauthorizedPage from '../UI/UnauthorizedPage'

export type LoginAutoRedirectProps = {
  fallback? : JSX.Element;
  isAuthorized? : (user: User) => boolean;
  unauthorizedPage? : ReactNode;
} & PropsWithChildren
export function LoginAutoRedirect({
  fallback,
  isAuthorized = () => true,
  unauthorizedPage = <UnauthorizedPage />,
  children,
} : LoginAutoRedirectProps) {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const [authorized, setAuthorized] = useState(false)
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login')
        setLogged(false)
        return
      }
      setLogged(true)
      if (!session.user || !isAuthorized(session.user)) {
        setAuthorized(false)
        return
      }
      setAuthorized(true)
    })
  })

  if (logged) {
    if (!authorized) {
      return unauthorizedPage
    }
    return children as JSX.Element
  }
  return fallback as JSX.Element
}
