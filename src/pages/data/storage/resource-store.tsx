/*************************************************************************/
/*  resource-store.tsx                                                   */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import MainLayout from '@components/MainLayout'

export default function ResourceStore() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Data' }],
        breadcrumbCurrentText: 'Resource store',
      }}
    >
      <h1>Resource store</h1>
    </MainLayout>
  )
}
