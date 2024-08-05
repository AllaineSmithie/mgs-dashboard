/*************************************************************************/
/*  [bucketref].tsx                                                      */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { useRouter } from 'next/router'
import MainLayout from '@components/MainLayout'

import StorageExplorer from '@components/Storage/StorageExplorer'

export default function BucketFiles() {
  const router = useRouter()
  const { bucketref } = router.query
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [
          { text: 'Data' },
          { text: 'Buckets', href: '/data/storage/buckets' },
        ],
        breadcrumbCurrentText: bucketref as string,
      }}
    >
      <StorageExplorer
        bucket={bucketref as string}
        onRootClicked={() => { router.push('/data/storage/buckets') }}
      />
    </MainLayout>
  )
}
