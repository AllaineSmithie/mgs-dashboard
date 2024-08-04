/*************************************************************************/
/*  404.tsx                                                              */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import MainLayout from '@components/MainLayout'

export default function Err404() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'Error',
      }}
    >
      <h1>404</h1>
      <p>Oops! Page not found</p>
    </MainLayout>
  )
}
