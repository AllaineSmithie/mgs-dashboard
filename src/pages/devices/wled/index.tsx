/*************************************************************************/
/*  index.tsx                                                            */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import MainLayout from '@components/MainLayout'

export default function WLED() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'Metro Gaya WLED Installer',
      }}
    >
      <button onClick={() => window.location.href='https://mgs-wled.netlify.app/'}>
        Go to External Site
      </button>
    </MainLayout>
  )
}
