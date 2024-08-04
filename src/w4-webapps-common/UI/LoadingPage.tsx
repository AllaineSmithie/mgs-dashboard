/*************************************************************************/
/*  LoadingPage.tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { globalCss } from '@stitches/core'
import Spinner from './Spinner'

const globalStyle = globalCss({
  'html, body, body > div:first-child, div#__next, div#__next > div': {
    height: '100%',
  },
})

export default function LoadingPage() {
  globalStyle()
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Spinner large className="dark:border-brand-600/30 dark:border-t-brand-600" />
    </div>
  )
}
