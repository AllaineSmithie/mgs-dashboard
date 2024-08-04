/*************************************************************************/
/*  _app.tsx                                                             */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { AppProps } from 'next/app'

import { config, library, IconDefinition } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { godotIcon } from '@webapps-common/icons/godot-icon'

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { Session, SupabaseClient, createClient } from '@supabase/supabase-js'
import { PropsWithChildren, useEffect, useState } from 'react'

import { ThemeProvider } from 'next-themes'

// Tailwind styles
import '@styles/globals.css'
import '@webapps-common/styles/globals.css'

import { LoadingPage } from '@webapps-common'
import { RuntimeEnvVarsContextProvider, useRuntimeEnvVars } from '@webapps-common/utils/runtimeEnvVarsEndpoint'

// Add Inter font
import { Inter as FontSans } from 'next/font/google'
import cn from '@webapps-common/utils/classNamesMerge'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

library.add(godotIcon as IconDefinition)

// You change this configuration value to false so that the Font Awesome core SVG library
// will not try and insert <style> elements into the <head> of the page.
// Next.js blocks this from happening anyway so you might as well not even try.
// See https://fontawesome.com/v6/docs/web/use-with/react/use-with#next-js
config.autoAddCss = false

type WorkspaceDashboardProps = Pick<AppProps, 'Component' | 'pageProps'> & {
  supabaseUrl: string;
  supabaseKey: string;
}
function WorkspaceDashboard({
  Component,
  pageProps,
}: WorkspaceDashboardProps) {
  return (
    <ThemeProvider attribute="class" value={{ dark: 'dark', light: 'light' }}>
      <RuntimeEnvVarsContextProvider>
        <SupabaseSessionProvider
          initialSession={pageProps.initialSession}
        >
          <main className={cn('font-sans', fontSans.variable)}>
            <Component {...pageProps} />
          </main>
        </SupabaseSessionProvider>
      </RuntimeEnvVarsContextProvider>
    </ThemeProvider>
  )
}

export default WorkspaceDashboard

type SupabaseSessionProviderProps = {
  initialSession: Session;
} & PropsWithChildren
function SupabaseSessionProvider({
  initialSession,
  children,
} : SupabaseSessionProviderProps) {
  const [error, setError] = useState<Error | undefined>(undefined)
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null)
  const envVars = useRuntimeEnvVars()

  useEffect(() => {
    if (!envVars) {
      return
    }
    if (envVars.error) {
      setError(envVars.error)
    } else if (!supabaseClient) {
      const client = createClient(
        envVars.env.RUNTIME_PUBLIC_SUPABASE_URL,
        envVars.env.RUNTIME_PUBLIC_SUPABASE_ANON_KEY,
      )
      setSupabaseClient(client)
    }
  }, [envVars, supabaseClient])

  let content = null
  if (error) {
    content = `An error occured. Could not retrieve the supabase endpoint: ${error}`
  } else if (!supabaseClient) {
    content = <LoadingPage />
  } else {
    content = (
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={initialSession}
      >
        {children}
      </SessionContextProvider>
    )
  }
  return content
}
