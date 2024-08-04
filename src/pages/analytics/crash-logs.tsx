/*************************************************************************/
/*  crash-logs.tsx                                                       */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import MainLayout from '@components/MainLayout'

export default function CrashLogs() {
  return (
    <MainLayout
      breadcrumb={{
        breadcrumbCurrentText: 'Crash Logs',
      }}
    >
      <h1>Crash logs</h1>
    </MainLayout>
  )
}
