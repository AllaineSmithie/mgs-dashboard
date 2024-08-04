/*************************************************************************/
/*  useHasMounted.ts                                                     */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useEffect, useRef } from 'react'

export default function useHasMounted() {
  const hasMounted = useRef(false)

  useEffect(() => {
    hasMounted.current = true
  }, [])

  return hasMounted.current
}
