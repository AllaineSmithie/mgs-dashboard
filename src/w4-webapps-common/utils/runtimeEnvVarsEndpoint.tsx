/*************************************************************************/
/*  runtimeEnvVarsEndpoint.tsx                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { NextApiRequest, NextApiResponse } from 'next'
import {
  PropsWithChildren, createContext, useContext, useEffect, useState,
} from 'react'

import { addBasePath } from 'next/dist/client/add-base-path'
import useSWRImmutable from 'swr'

const RUNTIME_ENV_PREFIX = 'RUNTIME_PUBLIC_'
const RUNTIME_ENV_API_ENDPOINT = '/api/runtime-env'

export type EnvVars = { [key : string] : string }

export function runtimeEnvVarsEndpoint(
  _req: NextApiRequest,
  res: NextApiResponse<EnvVars>,
) {
  const data = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k]) => k.startsWith(RUNTIME_ENV_PREFIX))
      .map(([k, v]) => [k, v as string]),
  )
  res.status(200).json(data)
}

export type RuntimeEnvVarsContextType = {
  error: Error;
  env: EnvVars;
} | undefined
const RuntimeEnvVarsContext = createContext<RuntimeEnvVarsContextType>(undefined)

export const useRuntimeEnvVars = (): RuntimeEnvVarsContextType => useContext(RuntimeEnvVarsContext)

export function RuntimeEnvVarsContextProvider({ children }: PropsWithChildren) {
  const [envVars, setEnvVars] = useState<EnvVars | undefined>()
  const [contextValue, setContextValue] = useState<RuntimeEnvVarsContextType>()

  const { error, isLoading, isValidating } = useSWRImmutable(
    addBasePath(RUNTIME_ENV_API_ENDPOINT),
    async (...args) => {
      const res = await fetch(...args)
      if (!res.ok) {
        throw new Error('Could not fetch runtime env variables.')
      }
      const json = await res.json()
      setEnvVars(json)
    },
  )

  useEffect(() => {
    if (isLoading || !envVars) {
      setContextValue(undefined)
    } else if (error) {
      setContextValue({
        error,
        env: {},
      })
    } else {
      setContextValue({
        error,
        env: envVars,
      })
    }
  }, [isLoading, isValidating, envVars, error])

  return (
    <RuntimeEnvVarsContext.Provider value={contextValue}>
      {children}
    </RuntimeEnvVarsContext.Provider>
  )
}
