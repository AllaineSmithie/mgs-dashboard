/*************************************************************************/
/*  logout.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect } from 'react'

import { LoadingPage } from '@webapps-common'

export default function Logout() {
  const router = useRouter()
  const supabaseClient = useSupabaseClient()

  useEffect(() => {
    supabaseClient.auth.signOut()
    router.push('/auth/login')
  })

  return <LoadingPage />
}
