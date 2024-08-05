/*************************************************************************/
/*  Footer.tsx                                                           */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { PropsWithChildren } from 'react'

export default function Footer({ children } : PropsWithChildren) {
  return (
    <footer className="tw-min-h-[3rem] tw-border-t-[1px] tw-border-t-border tw-flex tw-items-center tw-px-8 tw-py-2">
      <div>
        { children }
      </div>
    </footer>
  )
}
