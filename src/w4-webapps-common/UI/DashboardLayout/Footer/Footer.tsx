/*************************************************************************/
/*  Footer.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { PropsWithChildren } from 'react'

export default function Footer({ children } : PropsWithChildren) {
  return (
    <footer className="min-h-[3rem] border-t-[1px] border-t-border flex items-center px-8 py-2">
      <div>
        { children }
      </div>
    </footer>
  )
}
