/*************************************************************************/
/*  api.tsx                                                              */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { GetServerSideProps } from 'next'
import Link from 'next/link'
import MainLayout from '@components/MainLayout'
import { useState } from 'react'
import Button from '@webapps-common/UI/Button'
import { useRuntimeEnvVars } from '@webapps-common/utils/runtimeEnvVarsEndpoint'

type APIProps = {
  anonKey: string;
  serviceKey: string;
}

export const getServerSideProps: GetServerSideProps<APIProps> = async () => {
  const anonKey = process.env.RUNTIME_PUBLIC_SUPABASE_ANON_KEY as string
  const serviceKey = process.env.SUPABASE_SERVICE_KEY as string
  return { props: { anonKey, serviceKey } }
}

function KeyBox({
  title,
  value,
} : {
  title: string;
  value: string;
}) {
  const [show, setShow] = useState<boolean>(false)

  return (
    <div className="tw-border-2 tw-border-solid tw-rounded-lg tw-border-border tw-mt-5">
      <div className="tw-border-0 tw-border-b-2 tw-border-solid tw-border-border">
        <div className="tw-flex">
          <h5 className="tw-grow tw-p-3 tw-ms-2 tw-m-auto">{title}</h5>
          <Button
            className="tw-shrink tw-p-3 tw-m-2"
            onClick={() => { setShow(!show) }}
          >
            {show ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>
      <div className="tw-p-3 tw-break-all">
        {show ? value : '*'.repeat(value.length)}
      </div>
    </div>
  )
}

export default function Api({ anonKey, serviceKey }: APIProps) {
  const envVars = useRuntimeEnvVars()

  return (
    <MainLayout
      breadcrumb={{
        breadcrumb: [{ text: 'Docs' }],
        breadcrumbCurrentText: 'API',
      }}
    >
      <div className="tw-prose dark:tw-prose-invert">
        <h2 className="tw-p-3">Documentation</h2>

        The w4gd documentation is available
        {' '}
        <Link href={envVars?.env.RUNTIME_PUBLIC_API_DOCS_URL || ''}>
          here
        </Link>
      </div>
      <div className="tw-mt-6">
        <h3 className="tw-p-3">API keys</h3>
        <KeyBox
          title="Anonymous API key"
          value={anonKey}
        />
        <KeyBox
          title="Service API key"
          value={serviceKey}
        />
      </div>
    </MainLayout>
  )
}
