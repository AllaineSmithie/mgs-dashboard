/*************************************************************************/
/*  api.tsx                                                              */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import MainLayout from '@components/MainLayout'

export default function API() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'API',
      }}
    >
      <h1>API</h1>
    </MainLayout>
  )
}
