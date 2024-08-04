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
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col flex-cols-1">
        <h1 className="text-lg">Unauthorized</h1>
        <p className="mt-3">
          You do not have the permissions required to use this application.
        </p>
        <div className="flex justify-center">
          <Button
            className="mt-3 basis-1/4"
            onClick={() => router.push(addBasePath('/auth/logout'))}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
