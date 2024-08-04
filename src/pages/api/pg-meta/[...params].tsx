/*************************************************************************/
/*  [...params].tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, headers, query } = req
  const { params, ...queryParams } = query

  // Get the request's path and join it with the base URL
  const path = (params as string[]).join('/')
  const url = new URL(`${process.env.PGMETA_ENDPOINT}/${path}`)

  // Add the query parameters from the original request, like "?included_schemas=public"
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, value as string)
  })

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: headers as HeadersInit,
      // Only send the body if it's not a GET request
      body: method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.json()

    res.status(response.status).json(data)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}
