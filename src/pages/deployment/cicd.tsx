/*************************************************************************/
/*  cicd.tsx                                                             */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import MainLayout from '@components/MainLayout'

export default function GameVersions() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'CICD',
      }}
    >
      <h1>CI / CD</h1>
    </MainLayout>
  )
}
