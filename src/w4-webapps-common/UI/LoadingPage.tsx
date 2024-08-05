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
    <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-full">
      <Spinner large className="dark:tw-border-brand-600/30 dark:tw-border-t-brand-600" />
    </div>
  )
}
