/*************************************************************************/
/*  Portal.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useEffect, useState, PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'

export default function Portal({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  return mounted ? createPortal(children, document.body) : null
}
