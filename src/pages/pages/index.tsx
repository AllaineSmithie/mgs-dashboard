/*************************************************************************/
/*  index.tsx                                                            */
/*************************************************************************/
/* Copyright Deadline Entertainment Gbr                                  */
/* SPDX-License-Identifier: AGPL-3.0-only                                */

import MainLayout from '@components/MainLayout'

export default function Pages() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'Messages',
      }}
    >
      <PagesList />
    </MainLayout>
  )
}

function PagesList() {
  return (
    <div />
  )
}
