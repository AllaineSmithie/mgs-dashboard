/*************************************************************************/
/*  usePGMetaClient.ts                                                   */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { addBasePath } from 'next/dist/client/add-base-path'

export default function usePGMetaClient() {
  const supabase = useSupabaseClient()

  // Simplify talking to the pg-meta endpoint
  async function supabaseFetcher(url: string, options?: RequestInit, abortSignal?: AbortSignal) {
    const endpointUrl = joinPaths(addBasePath('/api/pg-meta/'), url)
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    const fetchOptions = {
      ...options,
      signal: abortSignal,
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
    try {
      const response = await fetch(endpointUrl, fetchOptions)
      if (!response.ok) {
        const errorResponse = await response.json()
        let errorMessage = errorResponse.error || errorResponse.message || errorResponse
        if (typeof errorMessage === 'object') errorMessage = JSON.stringify(errorMessage)
        return { data: null, error: errorMessage }
      }
      return { data: await response.json(), error: null }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return { data: null, error: null }
      }
      return { data: null, error }
    }
  }

  // QUERY FUNCTIONS
  async function executeQuery(queryString: string) {
    const { data, error } = await supabaseFetcher('query', {
      method: 'POST',
      body: JSON.stringify({ query: queryString }),
    })
    return { data, error }
  }

  // TABLES FUNCTIONS
  async function listTables(schemas: string[] = ['public']) {
    let schemasString = ''
    if (schemas.length) {
      schemasString = `?included_schemas=${schemas.join(',')}`
    }
    const { data, error } = await supabaseFetcher(`tables${schemasString}`)
    return { data, error }
  }

  async function deleteById(tableId: number) {
    const { error: deleteError } = await supabaseFetcher(`tables/${tableId}`, {
      method: 'DELETE',
    })
    return { data: null, error: deleteError }
  }

  async function deleteByName(tableName: string) {
    const { data: tablesData, error: tablesError } = await listTables()
    if (tablesError) return { data: null, error: tablesError }
    const targetTable = tablesData.find((table: { name: string }) => table.name === tableName)
    if (!targetTable) return { data: null, error: `Table "${tableName}" not found` }
    const { data, error } = await deleteById(targetTable.id)
    return { data, error }
  }

  const query = { executeQuery }
  const tables = { listTables, deleteById, delete: deleteByName }

  return { query, tables }
}

function joinPaths(basePath: string, url: string) {
  // Ensure the url does not start with a slash to prevent double slashes
  const normalizedUrl = url.startsWith('/') ? url.slice(1) : url
  // Concatenate and return the full URL
  return basePath + normalizedUrl
}
