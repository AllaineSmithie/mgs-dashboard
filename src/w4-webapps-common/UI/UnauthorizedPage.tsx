/*************************************************************************/
/*  UnauthorizedPage.tsx                                                 */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { addBasePath } from 'next/dist/client/add-base-path'
import { globalCss } from '@stitches/core'
import { useRouter } from 'next/router'
import Button from './Button'

const globalStyle = globalCss({
  'html, body, body > div:first-child, div#__next, div#__next > div': {
    height: '100%',
  },
})
export default function UnauthorizedPage() {
  const router = useRouter()
  globalStyle()
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-full">
      <div className="tw-flex tw-flex-col tw-flex-cols-1">
        <h1 className="tw-text-lg">Unauthorized</h1>
        <p className="tw-mt-3">
          You do not have the permissions required to use this application.
        </p>
        <div className="tw-flex tw-justify-center">
          <Button
            className="tw-mt-3 tw-basis-1/4"
            onClick={() => router.push(addBasePath('/auth/logout'))}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
